import "tests/helpers/mockMortalForIntegration";

import ImageResizer from "@bam.tech/react-native-image-resizer";
import { useNetInfo } from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import {
  act,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import ObservationPhoto from "realmModels/ObservationPhoto";
import fetchCoarseUserLocation from "sharedHelpers/fetchCoarseUserLocation";
import * as useLocationPermission from "sharedHooks/useLocationPermission";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  queryClient,
  renderAppWithObservations,
} from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  const { makeRealmHooks } = jest.requireActual( "tests/helpers/uniqueRealm" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      ...makeRealmHooks( __filename ),
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const initialStoreState = useStore.getState( );
beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

const withLocationSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Withlocationus primus" } ),
  combined_score: 95,
};
const withoutLocationSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Nolocationus secundus" } ),
  combined_score: 94,
};
const secondPhotoSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Otherphotous tertius" } ),
  combined_score: 93,
};
const onDevicePrediction = factory( "ModelPrediction", {
  rank_level: 10,
  combined_score: 92,
} );

const mockUser = factory( "LocalUser" );

const makeObservation = ( overrides = {} ) => factory( "RemoteObservation", {
  _synced_at: null,
  needsSync: jest.fn( ( ) => true ),
  wasSynced: jest.fn( ( ) => false ),
  observationPhotos: [
    factory( "RemoteObservationPhoto" ),
    factory( "RemoteObservationPhoto" ),
  ],
  user: mockUser,
  observed_on_string: "2020-01-01",
  latitude: 4,
  longitude: 10,
  ...overrides,
} );

const actor = userEvent.setup( );

const makeObservationWithLocalPhoto = ( overrides = {} ) => makeObservation( {
  observationPhotos: [factory( "LocalObservationPhoto", {
    photo: factory( "LocalPhoto", { url: undefined, localFilePath: "photoUploads/local.jpg" } ),
  } )],
  ...overrides,
} );

const openSuggestionsFromObsEdit = async ( observation = makeObservation( ) ) => {
  useStore.setState( {
    observations: [observation],
    currentObservation: observation,
  } );
  setStoreStateLayout( {
    isDefaultMode: false,
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
    isAllAddObsOptionsMode: true,
  } );
  await renderAppWithObservations( [observation], __filename );
  const observationGridItem = await screen.findByTestId(
    `MyObservations.obsGridItem.${observation.uuid}`,
  );
  await actor.press( observationGridItem );
  await actor.press( await screen.findByText( "IDENTIFY" ) );
  return ObservationPhoto.mapObsPhotoUris( observation );
};

const lastScoreImageParams = ( ) => inatjs.computervision.score_image.mock.lastCall[0];

// score_image answers by whether the request has a location
const mockScoreImageByLocation = ( ) => {
  inatjs.computervision.score_image.mockImplementation( async params => makeResponse( [
    params.lat === undefined
      ? withoutLocationSuggestion
      : withLocationSuggestion,
  ] ) );
};

// a 503 isn't retried, so the request fails once and stays failed
const makeServerDownError = ( ) => Object.assign(
  new Error( "Service Unavailable" ),
  { status: 503 },
);

const expectSuggestion = async suggestion => {
  expect(
    await screen.findByTestId( `SuggestionsList.taxa.${suggestion.taxon.id}` ),
  ).toBeVisible( );
};

describe( "Suggestions requests", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    mockScoreImageByLocation( );
    getPredictionsForImage.mockResolvedValue( { predictions: [onDevicePrediction] } );
  } );

  afterEach( ( ) => {
    signOut( { realm: global.mockRealms[__filename] } );
    inatjs.computervision.score_image.mockReset( );
    ImageResizer.createResizedImage.mockClear( );
    queryClient.clear( );
  } );

  it( "sends the observation's location with the first request", async ( ) => {
    await openSuggestionsFromObsEdit( );
    await expectSuggestion( withLocationSuggestion );
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
    expect( lastScoreImageParams( ) ).toEqual( expect.objectContaining( { lat: 4, lng: 10 } ) );
  } );

  it( "keeps the location it opened with when the observation's location changes", async ( ) => {
    await openSuggestionsFromObsEdit( );
    await expectSuggestion( withLocationSuggestion );
    act( ( ) => {
      useStore.getState( ).updateObservationKeys( { latitude: 4.001, longitude: 10.001 } );
    } );
    await expectSuggestion( withLocationSuggestion );
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
  } );

  it( "scores the other photo when it is pressed", async ( ) => {
    const [firstPhotoUri, secondPhotoUri] = await openSuggestionsFromObsEdit( );
    await expectSuggestion( withLocationSuggestion );
    expect( ImageResizer.createResizedImage.mock.lastCall[0] ).toEqual( firstPhotoUri );

    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [secondPhotoSuggestion] ) );
    await actor.press( screen.getByTestId( `ObsPhotoSelectionList.${secondPhotoUri}` ) );

    await expectSuggestion( secondPhotoSuggestion );
    expect( ImageResizer.createResizedImage.mock.lastCall[0] ).toEqual( secondPhotoUri );
    expect( lastScoreImageParams( ) ).toEqual( expect.objectContaining( { lat: 4, lng: 10 } ) );
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 2 );
  } );

  it( "requests again without location, then shows the located result again", async ( ) => {
    await openSuggestionsFromObsEdit( );
    await expectSuggestion( withLocationSuggestion );

    await actor.press( await screen.findByText( /IGNORE LOCATION/ ) );
    await expectSuggestion( withoutLocationSuggestion );
    expect( lastScoreImageParams( ) ).not.toHaveProperty( "lat" );
    expect( lastScoreImageParams( ) ).not.toHaveProperty( "lng" );

    await actor.press( await screen.findByText( /USE LOCATION/ ) );
    await expectSuggestion( withLocationSuggestion );
    expect( await screen.findByText( /IGNORE LOCATION/ ) ).toBeVisible( );
    // the located response is reused, not requested a second time
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 2 );
  } );

  it( "falls back to on-device suggestions when the request fails", async ( ) => {
    inatjs.computervision.score_image.mockRejectedValue( makeServerDownError( ) );
    await openSuggestionsFromObsEdit( );
    await expectSuggestion( { taxon: { id: onDevicePrediction.taxon_id } } );
    expect( screen.getByText( /You are offline. Tap to reload/ ) ).toBeVisible( );
    expect( screen.queryByText( /IGNORE LOCATION/ ) ).toBeNull( );
  } );

  it( "falls back to on-device suggestions when the request is slow", async ( ) => {
    inatjs.computervision.score_image.mockImplementation( ( ) => new Promise( ( ) => {} ) );
    await openSuggestionsFromObsEdit( );
    await waitFor( ( ) => {
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
    } );
    expect( screen.queryByText( /You are offline. Tap to reload/ ) ).toBeNull( );
    await act( async ( ) => {
      jest.advanceTimersByTime( 5_000 );
    } );
    await expectSuggestion( { taxon: { id: onDevicePrediction.taxon_id } } );
    expect( screen.getByText( /You are offline. Tap to reload/ ) ).toBeVisible( );
  } );

  it( "requests online suggestions again when the offline notice is pressed", async ( ) => {
    inatjs.computervision.score_image.mockRejectedValue( makeServerDownError( ) );
    await openSuggestionsFromObsEdit( );
    const offlineNotice = await screen.findByText( /You are offline. Tap to reload/ );

    mockScoreImageByLocation( );
    await actor.press( offlineNotice );

    await expectSuggestion( withLocationSuggestion );
    expect( screen.queryByText( /You are offline. Tap to reload/ ) ).toBeNull( );
  } );

  it( "asks the server about the other photo after falling back for the first", async ( ) => {
    inatjs.computervision.score_image.mockImplementation( ( ) => new Promise( ( ) => {} ) );
    const [, secondPhotoUri] = await openSuggestionsFromObsEdit( );
    await waitFor( ( ) => {
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
    } );
    await act( async ( ) => {
      jest.advanceTimersByTime( 5_000 );
    } );
    await expectSuggestion( { taxon: { id: onDevicePrediction.taxon_id } } );

    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [secondPhotoSuggestion] ) );
    await actor.press( screen.getByTestId( `ObsPhotoSelectionList.${secondPhotoUri}` ) );

    await expectSuggestion( secondPhotoSuggestion );
    expect( screen.queryByText( /You are offline. Tap to reload/ ) ).toBeNull( );
  } );

  it( "doesn't request again when Suggestions is reopened for the same photo", async ( ) => {
    await openSuggestionsFromObsEdit( );
    await expectSuggestion( withLocationSuggestion );
    await actor.press( screen.getByTestId( "header-back-button" ) );
    await actor.press( await screen.findByText( "IDENTIFY" ) );
    await expectSuggestion( withLocationSuggestion );
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
  } );

  describe( "without location permission", ( ) => {
    let onPermissionGranted;
    beforeEach( ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: false,
        renderPermissionsGate: gateProps => {
          ( { onPermissionGranted } = gateProps );
          return null;
        },
        requestPermissions: jest.fn( ),
      } ) );
      fetchCoarseUserLocation.mockResolvedValue( { latitude: 7, longitude: 8 } );
    } );
    afterEach( ( ) => {
      jest.mocked( useLocationPermission.default ).mockRestore( );
    } );

    it( "asks again with the location once permission is granted", async ( ) => {
      await openSuggestionsFromObsEdit( makeObservation( { latitude: null, longitude: null } ) );
      await expectSuggestion( withoutLocationSuggestion );
      expect( lastScoreImageParams( ) ).not.toHaveProperty( "lat" );

      await act( async ( ) => { await onPermissionGranted( ); } );

      await expectSuggestion( withLocationSuggestion );
      expect( lastScoreImageParams( ) ).toEqual( expect.objectContaining( { lat: 7, lng: 8 } ) );
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 2 );
    } );
  } );

  describe( "in airplane mode", ( ) => {
    const originalUseNetInfo = useNetInfo.getMockImplementation( );
    // the app sets react-query's online state from NetInfo too
    beforeEach( ( ) => onlineManager.setOnline( false ) );
    afterEach( ( ) => {
      onlineManager.setOnline( true );
      useNetInfo.mockImplementation( originalUseNetInfo );
    } );

    it( "shows on-device suggestions for a local photo", async ( ) => {
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await openSuggestionsFromObsEdit( makeObservationWithLocalPhoto( ) );
      await expectSuggestion( { taxon: { id: onDevicePrediction.taxon_id } } );
      expect( screen.getByText( /You are offline. Tap to reload/ ) ).toBeVisible( );
      expect( inatjs.computervision.score_image ).not.toHaveBeenCalled( );
    } );
  } );

  describe( "with a remote photo while offline", ( ) => {
    const originalUseNetInfo = useNetInfo.getMockImplementation( );
    afterEach( ( ) => {
      useNetInfo.mockImplementation( originalUseNetInfo );
    } );

    it( "asks for a connection instead of running the on-device model", async ( ) => {
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      getPredictionsForImage.mockClear( );
      await openSuggestionsFromObsEdit( );
      expect(
        await screen.findByText( /You are offline. Tap to reload/ ),
      ).toBeVisible( );
      expect( inatjs.computervision.score_image ).not.toHaveBeenCalled( );
      expect( getPredictionsForImage ).not.toHaveBeenCalled( );
    } );
  } );
} );
