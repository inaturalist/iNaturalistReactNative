import {
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import * as rnImagePicker from "react-native-image-picker";
import useStore from "stores/useStore";
// import os from "os";
// import path from "path";
// import Realm from "realm";
// import realmConfig from "realmModels/index";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import {
  renderAppWithObservations
} from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

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

const mockMultipleAssets = [{
  uri: faker.image.url( )
}, {
  uri: faker.image.url( )
}];

jest.mock( "react-native-image-picker", ( ) => ( {
  launchImageLibrary: jest.fn( )
} ) );

const actor = userEvent.setup( );

const navigateToObsEditViaGroupPhotos = async ( ) => {
  jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation(
    ( ) => ( {
      assets: mockMultipleAssets
    } )
  );
  await waitFor( ( ) => {
    global.timeTravel( );
    expect( screen.getByText( /OBSERVATIONS/ ) ).toBeVisible( );
  } );
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  await actor.press( addObsButton );
  const photoImporter = await screen.findByLabelText( "Photo importer" );
  await actor.press( photoImporter );
  const groupPhotosText = await screen.findByText( /Group Photos/ );
  await waitFor( ( ) => {
    // user should land on GroupPhotos
    expect( groupPhotosText ).toBeTruthy( );
  } );
  const importObservationsText = await screen.findByText( /IMPORT 2 OBSERVATIONS/ );
  await actor.press( importObservationsText );
  await waitFor( ( ) => {
    const obsEditTitleText = screen.getByText( /2 Observations/ );
    expect( obsEditTitleText ).toBeVisible( );
  }, { timeout: 3_000, interval: 500 } );
};

const saveObsEditObservation = async ( ) => {
  const saveButton = await screen.findByText( /SAVE/ );
  await actor.press( saveButton );
  // missing evidence sheet pops up here, so need to press SAVE twice
  const okButton = await screen.findByText( /OK/ );
  await actor.press( okButton );
  await actor.press( saveButton );
};

const uploadObsEditObservation = async options => {
  const uploadButton = await screen.findByText( /UPLOAD/ );
  await actor.press( uploadButton );
  if ( options?.skipMissingEvidence ) {
    return;
  }
  // missing evidence sheet pops up here, so need to press UPLOAD twice
  const okButton = await screen.findByText( /OK/ );
  await actor.press( okButton );
  await actor.press( uploadButton );
};

beforeEach( ( ) => {
  useStore.setState( {
    layout: {
      isDefaultMode: false,
      isAllAddObsOptionsMode: true
    }
  } );
} );

describe( "ObsEdit", ( ) => {
  async function findAndPressById( labelText ) {
    const pressable = await screen.findByTestId( labelText );
    await actor.press( pressable );
    return pressable;
  }

  const mockUser = factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en"
  } );

  const observation = factory( "LocalObservation", {
    _created_at: faker.date.past( ),
    taxon: factory( "LocalTaxon", {
      name: faker.person.firstName( )
    } )
  } );

  const mockObservations = [observation];

  beforeAll( async () => {
    jest.useFakeTimers( );
    useStore.setState( {
      initialNumObservationsInQueue: 3,
      numUploadsAttempted: 2
    } );
  } );

  describe( "from MyObservations", ( ) => {
    async function navigateToObsEditOrObsDetails( observations ) {
      await renderAppWithObservations( observations, __filename );
      const observationGridItem = await screen.findByTestId(
        `MyObservations.obsGridItem.${observations[0].uuid}`
      );
      await actor.press( observationGridItem );
    }

    it( "should show correct observation when navigating from MyObservations", async ( ) => {
      await navigateToObsEditOrObsDetails( mockObservations );
      expect( await screen.findByText( /Edit Observation/ ) ).toBeTruthy( );
      expect( await screen.findByText( mockObservations[0].taxon.name ) ).toBeTruthy( );
    } );

    describe( "while signed in", ( ) => {
      beforeEach( async ( ) => {
        await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      } );

      afterEach( ( ) => {
        signOut( { realm: global.mockRealms[__filename] } );
      } );

      it( "should show correct observation when navigating from ObsDetails", async ( ) => {
        const syncedObservation = factory( "LocalObservation", {
          _created_at: faker.date.past( ),
          _synced_at: faker.date.past( ),
          wasSynced: jest.fn( ( ) => true ),
          needsSync: jest.fn( ( ) => false ),
          taxon: factory( "LocalTaxon", {
            name: faker.person.firstName( )
          } )
        } );
        await navigateToObsEditOrObsDetails( [syncedObservation] );
        await findAndPressById( "ObsDetail.editButton" );
        expect( await screen.findByText( /Edit Observation/ ) ).toBeTruthy( );
        expect( await screen.findByText( syncedObservation.taxon.name ) ).toBeTruthy( );
      } );

      it.todo( "should show photos when reached from ObsDetails" );

      it( "should go back to GroupPhotos if no observations are saved/uploaded"
        + " in the multi-observation flow", async ( ) => {
        await renderAppWithObservations( mockObservations, __filename );
        await navigateToObsEditViaGroupPhotos( );
        const backButtonId = screen.getByTestId( "ObsEdit.BackButton" );
        await actor.press( backButtonId );
        const groupPhotosText = await screen.findByText( /Group Photos/ );
        expect( groupPhotosText ).toBeTruthy( );
      } );

      it( "should show discard observations sheet if at least one observation is saved/uploaded"
        + " in the multi-observation flow", async ( ) => {
        await renderAppWithObservations( mockObservations, __filename );
        await navigateToObsEditViaGroupPhotos( );
        await saveObsEditObservation( );
        const newTitle = await screen.findByText( /New Observation/ );
        expect( newTitle ).toBeTruthy( );
        const backButtonId = screen.getByTestId( "ObsEdit.BackButton" );
        await actor.press( backButtonId );
        const warningText = await screen.findByText( /By exiting, your observation will not be saved./ );
        expect( warningText ).toBeTruthy( );
      } );

      it( "should clear upload queue when user lands on ObsEdit", async ( ) => {
        await renderAppWithObservations( mockObservations, __filename );
        await navigateToObsEditViaGroupPhotos( );
        const { initialNumObservationsInQueue, numUploadsAttempted } = useStore.getState( );
        expect( initialNumObservationsInQueue ).toEqual( 0 );
        expect( numUploadsAttempted ).toEqual( 0 );
      } );

      it( "should show uploading status after user starts one upload"
        + " in the multi-observation flow", async ( ) => {
        inatjs.photos.create.mockImplementation(
          ( ) => Promise.resolve( makeResponse( [{
            id: faker.number.int()
          }] ) )
        );
        inatjs.observations.create.mockImplementation(
          ( params, _opts ) => Promise.resolve( makeResponse( [{
            id: faker.number.int(),
            uuid: params.observation.uuid
          }] ) )
        );
        inatjs.observation_photos.create.mockImplementation(
          ( ) => Promise.resolve( makeResponse( [{
            id: faker.number.int()
          }] ) )
        );
        await renderAppWithObservations( mockObservations, __filename );
        await navigateToObsEditViaGroupPhotos( );
        await uploadObsEditObservation( );
        const uploadStatus = await screen.findByText( /1 uploaded/ );
        expect( uploadStatus ).toBeVisible( );
        const newTitle = await screen.findByText( /New Observation/ );
        expect( newTitle ).toBeTruthy( );
      } );
    } );
  } );
} );
