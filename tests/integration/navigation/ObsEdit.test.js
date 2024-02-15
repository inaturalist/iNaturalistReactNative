import { faker } from "@faker-js/faker";
import {
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
// import os from "os";
// import path from "path";
// import Realm from "realm";
// import realmConfig from "realmModels/index";
import factory from "tests/factory";
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
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier]
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

describe( "ObsEdit", ( ) => {
  const actor = userEvent.setup( );

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

  beforeAll( async () => {
    await initI18next();
    jest.useFakeTimers( );
  } );

  describe( "from MyObservations", ( ) => {
    const observation = factory( "LocalObservation", {
      _created_at: faker.date.past( ),
      taxon: factory( "LocalTaxon", {
        name: faker.person.firstName( )
      } )
    } );

    async function navigateToObsEditOrObsDetails( observations ) {
      await renderAppWithObservations( observations, __filename );
      const observationRow = await screen.findByTestId(
        `MyObservations.obsListItem.${observations[0].uuid}`
      );
      await actor.press( observationRow );
    }

    it( "should show correct observation when navigating from MyObservations", async ( ) => {
      const observations = [observation];
      await navigateToObsEditOrObsDetails( observations );
      expect( await screen.findByText( /Edit Observation/ ) ).toBeTruthy( );
      expect( await screen.findByText( observations[0].taxon.name ) ).toBeTruthy( );
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
    } );
  } );
} );
