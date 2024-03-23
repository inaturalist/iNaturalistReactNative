import {
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut, TEST_JWT } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en",
  species_count: faker.number.int(),
  created_at: "2000-05-09T01:17:05-01:00",
  updated_at: "2000-05-09T01:17:05-01:00"
} );

const mockTaxon = factory( "LocalTaxon" );

const mockObservations = [
  factory( "LocalObservation", {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
    user: mockUser,
    taxon: mockTaxon
  } )
];

const obs = mockObservations[0];

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

beforeAll( async () => {
  await initI18next();
  jest.useFakeTimers( );
} );

describe( "Explore navigation", ( ) => {
  const actor = userEvent.setup( );

  describe( "from MyObs", ( ) => {
    beforeEach( async ( ) => {
      // Write mock observation to realm
      safeRealmWrite( global.mockRealms[__filename], ( ) => {
        global.mockRealms[__filename].create( "Observation", mockObservations[0] );
      }, "write mock observation, navigation/Explore test" );

      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    } );

    afterEach( ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
    } );

    describe( "from MyObs toolbar", ( ) => {
      it( "should show observations view and navigate back to MyObs", async ( ) => {
        renderApp( );
        expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
        const exploreButton = await screen.findByLabelText( /See all your observations in explore/ );
        await actor.press( exploreButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
      } );
    } );

    describe( "from TaxonDetails", ( ) => {
      beforeEach( ( ) => {
        inatjs.taxa.fetch.mockResolvedValue( makeResponse( [mockTaxon] ) );
      } );

      it( "should show observations view and navigate back to TaxonDetails", async ( ) => {
        renderApp( );
        expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
        const firstObservation = await screen.findByTestId( "MyObservationsPressable" );
        await actor.press( firstObservation );
        const taxonPressable = await screen.findByTestId( `ObsDetails.taxon.${obs.taxon.id}` );
        await actor.press( taxonPressable );
        const exploreButton = await screen.findByLabelText( /See observations of this taxon in explore/ );
        await actor.press( exploreButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          taxon_id: mockTaxon.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = screen.queryByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        expect( exploreButton ).toBeVisible( );
      } );
    } );

    describe( "from UserProfile observations button", ( ) => {
      beforeEach( async ( ) => {
        inatjs.users.fetch.mockResolvedValue( makeResponse( [mockUser] ) );
        inatjs.relationships.search.mockResolvedValue( makeResponse( {
          results: []
        } ) );
      } );

      it( "should show observations view and navigate back to UserProfile", async ( ) => {
        renderApp( );
        expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
        const firstObservation = await screen.findByTestId( "MyObservationsPressable" );
        await actor.press( firstObservation );
        const userProfileButton = await screen.findByLabelText( `User @${obs.user.login}` );
        await actor.press( userProfileButton );
        expect( inatjs.users.fetch ).toHaveBeenCalled( );
        const observationsButton = await screen.findByLabelText( /See observations by this user in Explore/ );
        await actor.press( observationsButton );
        expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ), {
          api_token: TEST_JWT
        } );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const observationsViewIcon = await screen.findByLabelText( /Observations View/ );
        expect( observationsViewIcon ).toBeVisible( );
        const backButton = await screen.findByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        const journalPostsButton = await screen.findByText( /JOURNAL POSTS/ );
        await actor.press( journalPostsButton );
      } );
    } );

    describe( "from UserProfile species button", ( ) => {
      beforeEach( async ( ) => {
        inatjs.users.fetch.mockResolvedValue( makeResponse( [mockUser] ) );
        inatjs.relationships.search.mockResolvedValue( makeResponse( {
          results: []
        } ) );
        inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
          count: 1,
          taxon: factory( "RemoteTaxon" )
        }] ) );
      } );

      it( "should show species view and navigate back to UserProfile", async ( ) => {
        renderApp( );
        expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
        const firstObservation = await screen.findByTestId( "MyObservationsPressable" );
        await actor.press( firstObservation );
        const userProfileButton = await screen.findByLabelText( `User @${obs.user.login}` );
        await actor.press( userProfileButton );
        expect( inatjs.users.fetch ).toHaveBeenCalled( );
        const speciesButton = await screen.findByLabelText( /See species observed by this user in Explore/ );
        await actor.press( speciesButton );
        expect( inatjs.observations.speciesCounts ).toHaveBeenCalledWith( expect.objectContaining( {
          user_id: mockUser.id,
          verifiable: true
        } ) );
        const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
        expect( defaultGlobalLocation ).toBeVisible( );
        const speciesViewIcon = await screen.findByLabelText( /Species View/ );
        expect( speciesViewIcon ).toBeVisible( );
        const backButton = await screen.findByTestId( "Explore.BackButton" );
        await actor.press( backButton );
        const journalPostsButton = await screen.findByText( /JOURNAL POSTS/ );
        await actor.press( journalPostsButton );
      } );
    } );

    describe( "from bottom tab navigator", ( ) => {
      describe( "without location permissions", ( ) => {
        it( "should not have a back button", async ( ) => {
          renderApp( );
          expect( await screen.findByText( /Welcome back/ ) ).toBeVisible( );
          const exploreButton = await screen.findByLabelText( /Navigate to explore screen/ );
          await actor.press( exploreButton );
          const defaultGlobalLocation = await screen.findByText( /Worldwide/ );
          expect( defaultGlobalLocation ).toBeVisible( );
          const backButton = screen.queryByTestId( "Explore.BackButton" );
          expect( backButton ).toBeFalsy( );
        } );
      } );
    } );
  } );

  describe( "from Explore", ( ) => {

  } );
} );
