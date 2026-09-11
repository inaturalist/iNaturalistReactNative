import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import factory, { makeResponse } from "tests/factory";
import {
  enableExploreV2,
  lastObservationsSearchParams,
  navigateToExplore,
  openUniversalSearch,
  searchForTaxon,
  submitUniversalSearch,
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
  id: 745,
  name: "Silphium perfoliatum",
  preferred_common_name: "Cup Plant",
  rank: "species",
  rank_level: 10,
} );

const mockObservations = [factory( "RemoteObservation", { taxon: mockTaxon } )];

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

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
  inatjs.observations.search.mockResolvedValue( makeResponse( mockObservations ) );
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
    count: 1,
    taxon: mockTaxon,
  }] ) );
  inatjs.search.mockResolvedValue( makeResponse( [{
    type: "taxon",
    score: 1,
    taxon: mockTaxon,
  }] ) );
} );

beforeEach( async ( ) => {
  setStoreStateLayout( { isDefaultMode: false, isAllAddObsOptionsMode: true } );
  enableExploreV2( );
  inatjs.observations.search.mockClear( );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( async ( ) => {
  await signOut( { realm: global.mockRealms[__filename] } );
} );

global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

describe( "recent searches in Explore", ( ) => {
  it( "offers a searched subject as a recent search and searches it again", async ( ) => {
    renderApp( );
    await navigateToExplore( );
    await openUniversalSearch( );
    await searchForTaxon( mockTaxon );

    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).toMatchObject( { taxon_id: mockTaxon.id } );
    } );

    // Search again with nothing selected, so the subject goes back to all organisms
    await openUniversalSearch( );
    await submitUniversalSearch( );
    expect(
      within( await screen.findByTestId( "ExploreV2Header" ) )
        .queryByTestId( "ExploreV2Header.subject" ),
    ).toBeNull( );

    // The taxon is offered as a recent search
    await openUniversalSearch( );
    const recentRow = within( await screen.findByTestId( "RecentSearches" ) ).getByTestId(
      `UniversalSearchResult.taxon.${mockTaxon.id}`,
    );
    expect( recentRow ).toBeVisible( );

    // Tapping it fills the subject field, and searching from there restores it
    await actor.press( recentRow );
    await submitUniversalSearch( );

    const header = await screen.findByTestId( "ExploreV2Header" );
    expect( within( header ).getByTestId( "ExploreV2Header.subject" ) ).toBeVisible( );
    expect( within( header ).getByText( mockTaxon.name ) ).toBeVisible( );
  } );
} );
