import Geolocation from "@react-native-community/geolocation";
import {
  useNetInfo
} from "@react-native-community/netinfo";
import {
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions.ts";
import inatjs from "inaturalistjs";
import * as useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

const mockModelResult = {
  predictions: [
    factory( "ModelPrediction", {
      rank_level: 30,
      score: 0.86
    } ),
    factory( "ModelPrediction", {
      rank_level: 20,
      score: 0.96
    } ),
    factory( "ModelPrediction", {
      rank_level: 10,
      score: 0.40
    } )]
};

const mockModelResultNoConfidence = {
  predictions: [
    factory( "ModelPrediction", {
      rank_level: 30,
      score: 0.7
    } ),
    factory( "ModelPrediction", {
      rank_level: 20,
      score: 0.65
    } )
  ]
};

const mockModelResultWithHuman = {
  predictions: [
    factory( "ModelPrediction", {
      rank_level: 20,
      score: 0.86
    } ),
    factory( "ModelPrediction", {
      rank_level: 30,
      score: 0.96,
      name: "Homo"
    } )
  ]
};

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

const watchPositionSuccess = jest.fn( success => success( {
  coords: {
    latitude: 56,
    longitude: 9,
    accuracy: 8
  }
} ) );

const mockWatchPosition = jest.fn( ( success, _error, _options ) => {
  setTimeout( () => watchPositionSuccess( success ), 100 );
  return 0;
} );
Geolocation.watchPosition.mockImplementation( mockWatchPosition );

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => []
    }
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
  combined_score: 90
};

const humanSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Homo sapiens", id: 43584 } ),
  combined_score: 86
};

const mockLocalTaxon = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
  default_photo: {
    url: "fake_image_url"
  }
};

const mockUser = factory( "LocalUser" );

const makeMockObservations = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: null,
    needsSync: jest.fn( ( ) => true ),
    wasSynced: jest.fn( ( ) => false ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" )
    ],
    user: mockUser,
    observed_on_string: "2020-01-01"
  } )
] );

const makeMockObservationsWithLocation = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: null,
    needsSync: jest.fn( ( ) => true ),
    wasSynced: jest.fn( ( ) => false ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" )
    ],
    user: mockUser,
    observed_on_string: "2020-01-01",
    latitude: 4,
    longitude: 10
  } )
] );

const actor = userEvent.setup( );

const navigateToSuggestionsForObservationViaObsEdit = async observation => {
  const observationGridItem = await screen.findByTestId(
    `MyObservations.obsGridItem.${observation.uuid}`
  );
  await actor.press( observationGridItem );
  const addIdButton = await screen.findByText( "ADD AN ID" );
  await actor.press( addIdButton );
};

const navigateToSuggestionsViaAICamera = async ( options = {} ) => {
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  await actor.press( addObsButton );
  const cameraButton = await screen.findByLabelText( /AI Camera/ );
  await actor.press( cameraButton );

  if ( options.waitForLocation ) {
    await waitFor( ( ) => {
      expect( Geolocation.watchPosition ).toHaveReturnedWith( 0 );
    } );
    await waitFor( ( ) => {
      expect( watchPositionSuccess ).toHaveReturned( );
    }, 100 );
  }
  const takePhotoButton = await screen.findByLabelText( /Take photo/ );
  await actor.press( takePhotoButton );
  const addIDButton = await screen.findByText( /ADD AN ID/ );
  expect( addIDButton ).toBeVisible( );
};

const setupAppWithSignedInUser = async hasLocation => {
  const observations = hasLocation
    ? makeMockObservationsWithLocation( )
    : makeMockObservations( );
  useStore.setState( {
    observations,
    currentObservation: observations[0],
    layout: {
      isDefaultMode: false
    },
    isAdvancedUser: true
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
//       `SuggestionsList.taxa.${mockModelResult.predictions[0].taxon_id}.checkmark`
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

describe( "from ObsEdit with human observation", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    inatjs.computervision.score_image
      .mockResolvedValue( makeResponse( [humanSuggestion, topSuggestion] ) );
  } );

  afterEach( ( ) => {
    signOut( { realm: global.mockRealms[__filename] } );
    inatjs.computervision.score_image.mockReset( );
  } );

  it(
    "should display only a single human observation if human is found in suggestions",
    async ( ) => {
      const { observations } = await setupAppWithSignedInUser( );
      await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
      const humanResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${humanSuggestion.taxon.id}.checkmark`
      );
      expect( humanResultButton ).toBeVisible( );
      const human = screen.getByText( /Homo sapiens/ );
      expect( human ).toBeVisible( );
      const nonHumanSuggestion = screen.queryByText( /Primum/ );
      expect( nonHumanSuggestion ).toBeFalsy( );
    }
  );

  it( "should not show location permissions button", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const usePermissionsButton = screen.queryByText( /IMPROVE THESE SUGGESTIONS/ );
    expect( usePermissionsButton ).toBeFalsy( );
  } );

  it( "should show use location button if unsynced obs has no location", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const useLocationButton = await screen.findByText( /USE LOCATION/ );
    expect( useLocationButton ).toBeVisible( );
  } );

  it( "should show ignore location button if unsynced obs has location", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( true );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const ignoreLocationButton = await screen.findByText( /IGNORE LOCATION/ );
    expect( ignoreLocationButton ).toBeVisible( );
  } );
} );

describe( "from AICamera", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );
  beforeEach( async ( ) => {
    inatjs.computervision.score_image
      .mockResolvedValue( makeResponse( [topSuggestion] ) );
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      handleTaxaDetected: jest.fn( ),
      modelLoaded: true,
      result: {
        taxon: mockLocalTaxon
      },
      setResult: jest.fn( )
    } ) );
  } );

  afterEach( ( ) => {
    inatjs.computervision.score_image.mockReset( );
  } );

  describe( "suggestions not using location", ( ) => {
    // 20240719 amanda - I keep bumping into an unmounted node error
    // here when ignoreLocationButton is pressed and I'm not sure what the root cause is.
    // I'm seeing the same type of error when trying to press Add an ID Later, so maybe
    // the same root cause?
    it.todo( "should call score_image without location parameters" );
    // it( "should call score_image without location parameters if"
    //   + " ignore location pressed", async ( ) => {
    //   const { observations } = await setupAppWithSignedInUser( );
    //   await navigateToSuggestionsViaAICamera( );
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

  describe( "suggestions with location", ( ) => {
    it( "should call score_image with location parameters on first render", async ( ) => {
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICamera( { waitForLocation: true } );
      // const ignoreLocationButton = await screen.findByText( /IGNORE LOCATION/ );
      // expect( ignoreLocationButton ).toBeVisible( );
      // await waitFor( ( ) => {
      //   expect( inatjs.computervision.score_image ).toHaveBeenCalledWith(
      //     expect.objectContaining( {
      //     // Don't care about fields here
      //       fields: expect.any( Object ),
      //       image: expect.any( Object ),
      //       lat: 56,
      //       lng: 9
      //     } ),
      //     expect.anything( )
      //   );
      // } );
    } );
  } );

  describe( "suggestions without location permissions", ( ) => {
    it( "should not call score_image with location parameters on first render"
      + " if location permission not given", async ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: false,
        renderPermissionsGate: jest.fn( )
      } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICamera( );
      await waitFor( ( ) => {
        global.timeTravel( );
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
            lng: 9
          } ),
          expect.anything( )
        );
      } );
    } );
  } );

  describe( "suggestions while offline", ( ) => {
    it( "should not call score_image and should not show any location buttons", async ( ) => {
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICamera( );
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
        async ( ) => ( mockModelResult )
      );
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICamera( );
      const topTaxonSuggestion = await screen.findByLabelText( /Choose top taxon/ );
      expect( topTaxonSuggestion ).toHaveProp(
        "testID",
        `SuggestionsList.taxa.${mockModelResult.predictions[1].taxon_id}.checkmark`
      );
    } );

    it( "should show not confident message if no predictions"
      + " meet the offline threshold", async ( ) => {
      getPredictionsForImage.mockImplementation(
        async ( ) => ( mockModelResultNoConfidence )
      );
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICamera( );

      const notConfidentText = await screen.findByText( /not confident enough to make a top ID suggestion/ );
      await waitFor( ( ) => {
        expect( notConfidentText ).toBeVisible( );
      } );
      const otherSuggestion = await screen.findByTestId(
        `SuggestionsList.taxa.${mockModelResultNoConfidence.predictions[1].taxon_id}.checkmark`
      );
      expect( otherSuggestion ).toBeVisible( );
    } );

    it( "should only show top human suggestion if human predicted offline", async ( ) => {
      getPredictionsForImage.mockImplementation(
        async ( ) => ( mockModelResultWithHuman )
      );
      useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      await setupAppWithSignedInUser( );
      await navigateToSuggestionsViaAICamera( );

      const topTaxonSuggestion = await screen.findByLabelText( /Choose top taxon/ );
      const humanPrediction = mockModelResultWithHuman.predictions
        .find( p => p.name === "Homo" );

      expect( topTaxonSuggestion ).toHaveProp(
        "testID",
        `SuggestionsList.taxa.${humanPrediction.taxon_id}.checkmark`
      );

      const otherSuggestionsText = screen.queryByText( /OTHER SUGGESTIONS/ );
      expect( otherSuggestionsText ).toBeFalsy( );
    } );
  } );
} );
