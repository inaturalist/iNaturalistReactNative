import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import factory, { makeResponse } from "tests/factory";
import {
  lastObservationsSearchParams,
  navigateToExplore,
  openUniversalSearch,
  resetExploreV2,
} from "tests/helpers/exploreV2";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

jest.unmock( "@react-navigation/native" );

const mockUser = factory( "LocalUser", {
  login: faker.internet.username( ),
  locale: "en",
} );

const mockTaxon = factory( "RemoteTaxon", {
  name: "Eumyias thalassinus",
  preferred_common_name: "Verditer Flycatcher",
  rank: "species",
  rank_level: 10,
} );

const mockObservations = [factory( "RemoteObservation", { taxon: mockTaxon } )];

const mockObserver = factory( "RemoteUser", {
  login: faker.internet.username( ),
} );

jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: ( ) => Promise.resolve( { latitude: 37, longitude: 34 } ),
} ) );

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

const actor = userEvent.setup( );

const t = key => i18next.t( key );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
  inatjs.observations.search.mockResolvedValue( makeResponse( mockObservations ) );
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
    count: 1,
    taxon: mockTaxon,
  }] ) );
  inatjs.observations.observers.mockResolvedValue( makeResponse(
    [{ user: mockObserver, observation_count: 7 }],
  ) );
  inatjs.observations.identifiers.mockResolvedValue( makeResponse(
    [{ user: mockObserver, count: 3 }],
  ) );
} );

beforeEach( async ( ) => {
  setStoreStateLayout( { isDefaultMode: false, isAllAddObsOptionsMode: true } );
  resetExploreV2( );
  inatjs.observations.search.mockClear( );
  inatjs.observations.observers.mockClear( );
  inatjs.observations.identifiers.mockClear( );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( async ( ) => {
  await signOut( { realm: global.mockRealms[__filename] } );
} );

global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

const openAdvancedSearch = async ( ) => {
  await openUniversalSearch( );
  await actor.press( screen.getByText( t( "Advanced-Search" ) ) );
  await screen.findByTestId( "AdvancedSearch" );
};

const submitAdvancedSearch = async ( ) => {
  await actor.press( screen.getByTestId( "AdvancedSearch.searchButton" ) );
  await screen.findByTestId( "ExploreResults" );
};

describe( "advanced search", ( ) => {
  it( "filters the results query by the filters the user chose", async ( ) => {
    renderApp( );
    await navigateToExplore( );
    await openAdvancedSearch( );

    await actor.press( screen.getByText( t( "Casual--quality-grade" ) ) );
    await actor.press( screen.getByText( t( "Sounds" ) ) );
    await submitAdvancedSearch( );

    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).toMatchObject( {
        quality_grade: ["research", "needs_id", "casual"],
        sounds: true,
      } );
    } );

    expect( lastObservationsSearchParams( ) ).not.toHaveProperty( "verifiable" );
  } );

  it(
    "offers observers and identifiers, with the filters in effect, only in advanced search",
    async ( ) => {
      renderApp( );
      await navigateToExplore( );

      const tabs = await screen.findByTestId( "ExploreV2Tabs" );
      expect( within( tabs ).queryByTestId( "ExploreV2Tabs.observers" ) ).toBeNull( );
      expect( within( tabs ).queryByTestId( "ExploreV2Tabs.identifiers" ) ).toBeNull( );
      expect( inatjs.observations.observers ).not.toHaveBeenCalled( );

      await openAdvancedSearch( );
      await actor.press( screen.getByText( t( "Sounds" ) ) );
      await submitAdvancedSearch( );

      expect( await screen.findByTestId( "ExploreV2Tabs.identifiers" ) ).toBeVisible( );
      // The tab shows the count from the observers endpoint
      const observersTab = await screen.findByTestId( "ExploreV2Tabs.observers" );
      await waitFor( ( ) => {
        expect( within( observersTab ).getByText( "1" ) ).toBeVisible( );
      } );

      await actor.press( observersTab );

      expect( await screen.findByText( mockObserver.login ) ).toBeVisible( );
      const observerQueries = inatjs.observations.observers.mock.calls
        .map( ( [params] ) => params );
      expect( observerQueries.length ).toBeGreaterThan( 0 );
      observerQueries.forEach( params => {
        expect( params.sounds ).toBe( true );
      } );
    },
  );
} );
