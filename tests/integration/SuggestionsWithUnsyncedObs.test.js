import "tests/helpers/mockMortalForIntegration";

import {
  useNetInfo,
} from "@react-native-community/netinfo";
import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import { photoUploadPath } from "appConstants/paths";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions";
import inatjs from "inaturalistjs";
import { Animated, Image } from "react-native";
import { State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";
import * as useLocationPermission from "sharedHooks/useLocationPermission";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  navigateToSuggestionsViaAICameraFromMyObs,
} from "tests/helpers/addObsBottomSheet";
import { renderAppWithObservations } from "tests/helpers/render";
import setStoreStateFeatureFlags from "tests/helpers/setStoreStateFeatureFlags";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

// Not my favorite code, but this patch is necessary to get tests passing right
// now unless we can figure out why Animated.Value is being passed undefined,
// which seems related to the AICamera
const OriginalValue = Animated.Value;

beforeEach( () => {
  // Patch the Value constructor to be safer with undefined values
  Animated.Value = function ( val ) {
    return new OriginalValue( val === undefined
      ? 0
      : val );
  };
} );

afterEach( () => {
  // Restore original implementation
  Animated.Value = OriginalValue;
} );

const mockModelResult = {
  predictions: [
    factory( "ModelPrediction", {
      rank_level: 30,
      combined_score: 86,
    } ),
    factory( "ModelPrediction", {
      rank_level: 20,
      combined_score: 96,
    } ),
    factory( "ModelPrediction", {
      rank_level: 10,
      combined_score: 40,
    } )],
};

const mockModelResultNoConfidence = {
  predictions: [
    factory( "ModelPrediction", {
      rank_level: 30,
      combined_score: 70,
    } ),
    factory( "ModelPrediction", {
      rank_level: 20,
      combined_score: 65,
    } ),
  ],
};

const mockModelResultWithHuman = {
  predictions: [
    factory( "ModelPrediction", {
      rank_level: 20,
      combined_score: 86,
    } ),
    factory( "ModelPrediction", {
      rank_level: 30,
      combined_score: 96,
      name: "Homo",
    } ),
  ],
};

jest.mock( "react-native/Libraries/Utilities/Platform", () => ( {
  __esModule: true,
  default: {
    ...jest.requireActual( "react-native/Libraries/Utilities/Platform" ).default,
    Version: 11,
  },
} ) );

const mockUserLocation = { latitude: 56, longitude: 9, accuracy: 8 };
const mockFetchUserLocation = jest.fn( () => mockUserLocation );
jest.mock( "sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation(),
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

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90,
};

const humanSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Homo sapiens", id: 43584 } ),
  combined_score: 86,
};

const mockLocalTaxon = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
  default_photo: {
    url: "fake_image_url",
  },
};

const mockUser = factory( "LocalUser" );

const makeMockObservations = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: null,
    needsSync: jest.fn( ( ) => true ),
    wasSynced: jest.fn( ( ) => false ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" ),
    ],
    user: mockUser,
    observed_on_string: "2020-01-01",
  } ),
] );

const makeMockObservationsWithLocation = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: null,
    needsSync: jest.fn( ( ) => true ),
    wasSynced: jest.fn( ( ) => false ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" ),
    ],
    user: mockUser,
    observed_on_string: "2020-01-01",
    latitude: 4,
    longitude: 10,
  } ),
] );

const actor = userEvent.setup( );

const navigateToSuggestionsForObservationViaObsEdit = async observation => {
  const observationGridItem = await screen.findByTestId(
    `MyObservations.obsGridItem.${observation.uuid}`,
  );
  await actor.press( observationGridItem );
  const addIdButton = await screen.findByText( "IDENTIFY" );
  await actor.press( addIdButton );
};

const setupAppWithSignedInUser = async ( hasLocation, mockObservations ) => {
  const observations = mockObservations || ( hasLocation
    ? makeMockObservationsWithLocation( )
    : makeMockObservations( ) );
  useStore.setState( {
    observations,
    currentObservation: observations[0],
  } );
  setStoreStateLayout( {
    isDefaultMode: false,
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
    isAllAddObsOptionsMode: true,
  } );
  await renderAppWithObservations( observations, __filename );
  return { observations };
};

// TODO: fix this test. As of 20240627 we're bumping into issues with the
// 2.13 new vision camera not loading offline suggestions,
// so we may need this issue resolved before this test can be fixed:
// https://github.com/inaturalist/iNaturalistReactNative/issues/1715
// it(
//   "should try offline suggestions if no online suggestions are found",
//   async ( ) => {
//     const { observations } = await setupAppWithSignedInUser( );
//     await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
//     const offlineNotice = await screen.findByText( /You are offline. Tap to reload/ );
//     await waitFor( ( ) => {
//       expect( offlineNotice ).toBeTruthy( );
//     }, { timeout: 10000 } );
//     const topOfflineTaxonResultButton = await screen.findByTestId(
//       `SuggestionsList.taxa.${mockModelResult.predictions[0].taxon_id}`
//     );
//     expect( topOfflineTaxonResultButton ).toBeTruthy( );
//     await act( async ( ) => actor.press( topOfflineTaxonResultButton ) );
//     const saveButton = await screen.findByText( /SAVE/ );
//     expect( saveButton ).toBeTruthy( );
//     await actor.press( saveButton );
//     const savedObservation = global.mockRealms[__filename]
//       .objectForPrimaryKey( "Observation", observations[0].uuid );
//     expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", true );
//   }
// );

describe( "from ObsEdit with human observation", () => {
  beforeEach( async () => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    inatjs.computervision.score_image.mockResolvedValue(
      makeResponse( [humanSuggestion, topSuggestion] ),
    );
  } );

  afterEach( () => {
    signOut( { realm: global.mockRealms[__filename] } );
    inatjs.computervision.score_image.mockReset();
  } );

  it( "should display only a single human observation"
    + "if human is found in suggestions", async () => {
    const { observations } = await setupAppWithSignedInUser();
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const humanResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${humanSuggestion.taxon.id}`,
    );
    expect( humanResultButton ).toBeVisible();
    const human = screen.getByText( /Homo sapiens/ );
    expect( human ).toBeVisible();
    const nonHumanSuggestion = screen.queryByText( /Primum/ );
    expect( nonHumanSuggestion ).toBeFalsy();
  } );

  it( "should not show location permissions button", async () => {
    const { observations } = await setupAppWithSignedInUser();
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const usePermissionsButton = screen.queryByText(
      /IMPROVE THESE SUGGESTIONS/,
    );
    expect( usePermissionsButton ).toBeFalsy();
  } );

  it( "should not show use location button if unsynced obs has no location", async () => {
    const { observations } = await setupAppWithSignedInUser();
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const useLocationButton = screen.queryByText( /USE LOCATION/ );
    expect( useLocationButton ).toBeFalsy();
  } );

  it( "should show ignore location button if unsynced obs has location", async () => {
    const { observations } = await setupAppWithSignedInUser( true );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const ignoreLocationButton = await screen.findByText( /IGNORE LOCATION/ );
    expect( ignoreLocationButton ).toBeVisible();
  } );
} );

describe( "cropping a photo with no suggestions", ( ) => {
  const localFilePath = `${photoUploadPath}/local.jpg`;
  const makeMockObservationsWithLocalPhoto = ( ) => ( [
    factory( "RemoteObservation", {
      _synced_at: null,
      needsSync: jest.fn( ( ) => true ),
      wasSynced: jest.fn( ( ) => false ),
      observationPhotos: [factory( "LocalObservationPhoto", {
        photo: factory( "LocalPhoto", { url: undefined, localFilePath } ),
      } )],
      user: mockUser,
      observed_on_string: "2020-01-01",
    } ),
  ] );

  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: true } );
  } );

  afterEach( ( ) => {
    signOut( { realm: global.mockRealms[__filename] } );
    setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: false } );
    inatjs.computervision.score_image.mockReset( );
  } );

  it( "should fetch new suggestions for the cropped photo", async ( ) => {
    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [] ) );
    jest.spyOn( Image, "getSize" ).mockResolvedValue( { width: 2048, height: 1536 } );
    const { observations } = await setupAppWithSignedInUser(
      false,
      makeMockObservationsWithLocalPhoto( ),
    );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );

    await actor.press( await screen.findByText( "CROP PHOTO" ) );
    fireEvent( await screen.findByTestId( "PhotoCropper" ), "layout", {
      nativeEvent: { layout: { width: 400, height: 300 } },
    } );
    await waitFor( ( ) => {
      expect( getByGestureTestId( "PhotoCropper.handle.bottomRight" ) ).toBeTruthy( );
    } );
    fireGestureHandler( getByGestureTestId( "PhotoCropper.handle.bottomRight" ), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, translationX: -200, translationY: -150 },
      { state: State.END, translationX: -200, translationY: -150 },
    ] );
    await actor.press( screen.getByLabelText( "Save crop" ) );

    await waitFor( ( ) => {
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 2 );
    } );
    const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
    expect( photo.localFilePath ).not.toEqual( localFilePath );
  } );

  it( "should not be offered when there are suggestions", async ( ) => {
    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
    const { observations } = await setupAppWithSignedInUser(
      false,
      makeMockObservationsWithLocalPhoto( ),
    );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );

    expect( await screen.findByText( /Primum/ ) ).toBeVisible( );
    expect( screen.queryByText( "CROP PHOTO" ) ).toBeNull( );
  } );

  it( "should not be offered for a photo that has been uploaded", async ( ) => {
    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [] ) );
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );

    expect( await screen.findByText( /no ID suggestions/ ) ).toBeVisible( );
    expect( screen.queryByText( "CROP PHOTO" ) ).toBeNull( );
  } );
} );

describe( "editing the selected photo in the media viewer", ( ) => {
  const localFilePath = `${photoUploadPath}/local.jpg`;
  const localPhotoUri = `file://${localFilePath}`;
  const makeMockObservationsWithLocalPhoto = ( ) => ( [
    factory( "RemoteObservation", {
      _synced_at: null,
      needsSync: jest.fn( ( ) => true ),
      wasSynced: jest.fn( ( ) => false ),
      observationPhotos: [factory( "LocalObservationPhoto", {
        photo: factory( "LocalPhoto", { url: undefined, localFilePath } ),
      } )],
      user: mockUser,
      observed_on_string: "2020-01-01",
    } ),
  ] );

  const openMediaViewer = async ( ) => {
    const { observations } = await setupAppWithSignedInUser(
      false,
      makeMockObservationsWithLocalPhoto( ),
    );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    await waitFor( ( ) => {
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
    } );
    // Pressing the selected photo opens it in the media viewer
    await actor.press( await screen.findByTestId( `ObsPhotoSelectionList.${localPhotoUri}` ) );
  };

  const closeMediaViewer = async ( ) => {
    // The back button and its icon both carry the label
    const mediaViewer = screen.getByTestId( "MediaViewer" );
    const [backButton] = within( mediaViewer ).getAllByLabelText( "Go back" );
    await actor.press( backButton );
  };

  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: true } );
    inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
  } );

  afterEach( ( ) => {
    signOut( { realm: global.mockRealms[__filename] } );
    setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: false } );
    inatjs.computervision.score_image.mockReset( );
  } );

  it( "should fetch new suggestions for the edited photo when the viewer closes", async ( ) => {
    await openMediaViewer( );

    await actor.press( await screen.findByLabelText( "Rotate photo" ) );
    await waitFor( ( ) => {
      const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
      expect( photo.localFilePath ).not.toEqual( localFilePath );
    } );
    await closeMediaViewer( );

    await waitFor( ( ) => {
      expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 2 );
    } );
  } );

  it( "should not fetch new suggestions when the viewer closes without edits", async ( ) => {
    await openMediaViewer( );

    await screen.findByLabelText( "Rotate photo" );
    await closeMediaViewer( );

    await waitFor( ( ) => {
      expect( screen.queryByLabelText( "Rotate photo" ) ).toBeNull( );
    } );
    expect( inatjs.computervision.score_image ).toHaveBeenCalledTimes( 1 );
  } );
} );

describe( "from AICamera directly", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );
  beforeEach( async ( ) => {
    inatjs.computervision.score_image
      .mockResolvedValue( makeResponse( [topSuggestion] ) );
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      handleTaxaDetected: jest.fn( ),
      modelLoaded: true,
      result: {
        taxon: mockLocalTaxon,
      },
      setResult: jest.fn( ),
    } ) );
  } );

  afterEach( ( ) => {
    inatjs.computervision.score_image.mockReset( );
  } );

  describe( "suggestions with location", ( ) => {
    it( "should call score_image with location parameters on first render", async ( ) => {
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICameraFromMyObs( );
      await waitFor( ( ) => {
        expect( inatjs.computervision.score_image ).toHaveBeenCalledWith(
          expect.objectContaining( {
          // Don't care about fields here
            fields: expect.any( Object ),
            image: expect.any( Object ),
            lat: 56,
            lng: 9,
          } ),
          expect.anything( ),
        );
      } );
    } );
  } );

  describe( "suggestions without location permissions", ( ) => {
    afterEach( ( ) => {
      jest.mocked( useLocationPermission.default ).mockRestore( );
      mockFetchUserLocation.mockImplementation( ( ) => mockUserLocation );
    } );

    it( "should not call score_image with location parameters on first render"
      + " if location permission not given", async ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: false,
        renderPermissionsGate: jest.fn( ),
      } ) );
      mockFetchUserLocation.mockReturnValue( null );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICameraFromMyObs( );
      await waitFor( ( ) => {
        expect( screen.getByText( /IMPROVE THESE SUGGESTIONS/ ) ).toBeVisible( );
      } );
      const ignoreLocationButton = screen.queryByText( /IGNORE LOCATION/ );
      expect( ignoreLocationButton ).toBeFalsy( );
      const useLocationButton = screen.queryByText( /USE LOCATION/ );
      expect( useLocationButton ).toBeFalsy( );
      await waitFor( ( ) => {
        expect( inatjs.computervision.score_image ).toHaveBeenCalledWith(
          expect.not.objectContaining( {
            lat: 56,
            lng: 9,
          } ),
          expect.anything( ),
        );
      } );
    } );
  } );

  describe( "suggestions while offline", ( ) => {
    // otherwise the offline mock leaks into later tests
    const originalUseNetInfo = useNetInfo.getMockImplementation( );
    afterEach( ( ) => {
      useNetInfo.mockImplementation( originalUseNetInfo );
    } );

    it( "should not call score_image and should not show any location buttons", async ( ) => {
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICameraFromMyObs( );
      expect( inatjs.computervision.score_image ).not.toHaveBeenCalled( );
      const usePermissionsButton = screen.queryByText( /IMPROVE THESE SUGGESTIONS/ );
      expect( usePermissionsButton ).toBeFalsy( );
      const ignoreLocationButton = screen.queryByText( /IGNORE LOCATION/ );
      expect( ignoreLocationButton ).toBeFalsy( );
      const useLocationButton = screen.queryByText( /USE LOCATION/ );
      expect( useLocationButton ).toBeFalsy( );
    } );

    it( "should show top suggestion with finest rank if a prediction"
      + " is above offline threshold", async ( ) => {
      getPredictionsForImage.mockImplementation(
        async ( ) => ( mockModelResult ),
      );
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICameraFromMyObs( );
      const topTaxonSuggestion = await screen.findByTestId(
        `SuggestionsList.taxa.${mockModelResult.predictions[1].taxon_id}`,
      );
      expect( topTaxonSuggestion ).toBeVisible( );
    } );

    it( "should show not confident message if no predictions"
      + " meet the offline threshold", async ( ) => {
      getPredictionsForImage.mockImplementation(
        async ( ) => ( mockModelResultNoConfidence ),
      );
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICameraFromMyObs( );

      const notConfidentText = await screen.findByText( /not confident enough to make a top ID suggestion/ );
      await waitFor( ( ) => {
        expect( notConfidentText ).toBeVisible( );
      } );
      const otherSuggestion = await screen.findByTestId(
        `SuggestionsList.taxa.${mockModelResultNoConfidence.predictions[1].taxon_id}`,
      );
      expect( otherSuggestion ).toBeVisible( );
    } );

    it( "should only show top human suggestion if human predicted offline", async ( ) => {
      getPredictionsForImage.mockImplementation(
        async ( ) => ( mockModelResultWithHuman ),
      );
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICameraFromMyObs( );

      const humanPrediction = mockModelResultWithHuman.predictions
        .find( p => p.name === "Homo" );
      const topTaxonSuggestion = await screen.findByTestId(
        `SuggestionsList.taxa.${humanPrediction.taxon_id}`,
      );
      expect( topTaxonSuggestion ).toBeVisible( );

      const otherSuggestionsText = screen.queryByText( /OTHER SUGGESTIONS/ );
      expect( otherSuggestionsText ).toBeFalsy( );
    } );
  } );

  describe( "suggestions not using location", () => {
    // 20240719 amanda - I keep bumping into an unmounted node error
    // here when ignoreLocationButton is pressed and I'm not sure what the root cause is.
    // I'm seeing the same type of error when trying to press Add an ID Later, so maybe
    // the same root cause?
    it.todo( "should call score_image without location parameters" );
    // it( "should call score_image without location parameters if"
    //   + " ignore location pressed", async ( ) => {
    //   const { observations } = await setupAppWithSignedInUser( );
    //   await navigateToSuggestionsViaAICameraFromMyObs( );
    //   await waitFor( ( ) => {
    //     expect( inatjs.computervision.score_image ).toHaveBeenCalled( );
    //   } );
    //   const ignoreLocationButton = screen.queryByText( /IGNORE LOCATION/ );
    //   expect( ignoreLocationButton ).toBeVisible( );
    //   await actor.press( ignoreLocationButton );
    //   await waitFor( ( ) => {
    //     expect( inatjs.computervision.score_image ).toHaveBeenCalledWith(
    //       expect.not.objectContaining( {
    //         lat: observations[0].latitude,
    //         lng: observations[0].longitude
    //       } ),
    //       expect.anything( )
    //     );
    //   } );
    //   const useLocationButton = await screen.findByText( /USE LOCATION/ );
    //   expect( useLocationButton ).toBeVisible( );
    // } );
  } );
} );
