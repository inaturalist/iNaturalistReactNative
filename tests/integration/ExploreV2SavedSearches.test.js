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
  name: "Eumyias thalassinus",
  preferred_common_name: "Verditer Flycatcher",
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

const t = key => i18next.t( key );

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
  resetExploreV2( );
  inatjs.observations.search.mockClear( );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( async ( ) => {
  await signOut( { realm: global.mockRealms[__filename] } );
} );

global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

describe( "saved searches", ( ) => {
  it( "saves the search, runs it again later, and unsaves it", async ( ) => {
    renderApp( );
    await navigateToExplore( );
    await openUniversalSearch( );
    await searchForTaxon( mockTaxon );

    await actor.press( await screen.findByLabelText( t( "Save-this-search" ) ) );

    // The toast fades in, so it is on the screen before it is visible
    expect( await screen.findByText( t( "ADDED-TO-SAVED-SEARCHES" ) ) ).toBeOnTheScreen( );
    expect( await screen.findByLabelText( t( "Remove-this-saved-search" ) ) ).toBeVisible( );

    // Search with nothing selected, which goes back to all organisms worldwide, so applying
    // the saved search has something to change
    await openUniversalSearch( );
    await submitUniversalSearch( );
    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).not.toHaveProperty( "taxon_id" );
    } );
    expect( await screen.findByLabelText( t( "Save-this-search" ) ) ).toBeVisible( );

    await openUniversalSearch( );
    const savedList = await screen.findByTestId( "SavedSearches" );
    await actor.press( within( savedList ).getByText( mockTaxon.name ) );

    await screen.findByTestId( "ExploreResults" );
    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).toMatchObject( { taxon_id: mockTaxon.id } );
    } );
    const header = await screen.findByTestId( "ExploreV2Header" );
    expect( within( header ).getByTestId( "ExploreV2Header.subject" ) ).toBeVisible( );

    const removeStar = await screen.findByLabelText( t( "Remove-this-saved-search" ) );
    expect( removeStar ).toBeVisible( );

    await actor.press( removeStar );

    expect( await screen.findByText( t( "REMOVED-FROM-SAVED-SEARCHES" ) ) ).toBeOnTheScreen( );
    await openUniversalSearch( );
    expect( screen.queryByTestId( "SavedSearches" ) ).toBeNull( );
  } );
} );
