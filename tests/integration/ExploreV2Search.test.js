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
  focusSearchField,
  lastObservationsSearchParams,
  navigateToExplore,
  openUniversalSearch,
  searchForTaxon,
  submitUniversalSearch,
  typeIntoSearchField,
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

const mockPlace = factory( "RemotePlace", {
  display_name: "Oakland, CA",
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

// The subject field and the location field both go through inatjs.search, told apart by source
const mockAutocomplete = ( ) => inatjs.search.mockImplementation( params => {
  if ( params.sources === "places" ) {
    return makeResponse( [{ type: "place", score: 1, place: mockPlace }] );
  }
  return makeResponse( [{ type: "taxon", score: 1, taxon: mockTaxon }] );
} );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
  inatjs.observations.search.mockResolvedValue( makeResponse( mockObservations ) );
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
    count: 1,
    taxon: mockTaxon,
  }] ) );
} );

beforeEach( async ( ) => {
  setStoreStateLayout( { isDefaultMode: false, isAllAddObsOptionsMode: true } );
  enableExploreV2( );
  mockAutocomplete( );
  inatjs.observations.search.mockClear( );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( async ( ) => {
  await signOut( { realm: global.mockRealms[__filename] } );
} );

global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

describe( "searching from Universal Search", ( ) => {
  it( "searches for species the signed-in user has not observed", async ( ) => {
    renderApp( );
    await navigateToExplore( );
    await openUniversalSearch( );

    await actor.press( await screen.findByTestId( "DefaultSearchOptions.unobserved" ) );
    await submitUniversalSearch( );

    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).toMatchObject( {
        unobserved_by_user_id: mockUser.id,
      } );
    } );
    const header = await screen.findByTestId( "ExploreV2Header" );
    expect( within( header ).getByTestId( "ExploreV2Header.unobserved" ) ).toBeVisible( );
  } );

  it( "searches the place the user picked and offers it again later", async ( ) => {
    renderApp( );
    await navigateToExplore( );
    await openUniversalSearch( );

    await typeIntoSearchField( "UniversalSearch.locationInput", "oakland" );
    await actor.press( await screen.findByText( mockPlace.display_name ) );
    await submitUniversalSearch( );

    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).toMatchObject( { place_id: mockPlace.id } );
    } );
    expect( lastObservationsSearchParams( ) ).not.toHaveProperty( "lat" );
    const header = await screen.findByTestId( "ExploreV2Header" );
    expect( within( header ).getByText( mockPlace.display_name ) ).toBeVisible( );

    // The place is remembered for the next search
    await openUniversalSearch( );
    await focusSearchField( "UniversalSearch.locationInput" );
    expect(
      within( await screen.findByTestId( "RecentLocations" ) )
        .getByText( mockPlace.display_name ),
    ).toBeVisible( );
  } );

  it( "still has the search when the user comes back from another tab", async ( ) => {
    renderApp( );
    await navigateToExplore( );
    await openUniversalSearch( );
    await searchForTaxon( mockTaxon );
    await waitFor( ( ) => {
      expect( lastObservationsSearchParams( ) ).toMatchObject( { taxon_id: mockTaxon.id } );
    } );

    const tabBar = await screen.findByTestId( "CustomTabBar" );
    await actor.press( within( tabBar ).getByTestId( "NavButton.personIcon" ) );
    await actor.press( within( tabBar ).getByText( "Explore" ) );

    await screen.findByTestId( "ExploreResults" );
    const header = await screen.findByTestId( "ExploreV2Header" );
    expect( within( header ).getByText( mockTaxon.name ) ).toBeVisible( );
  } );
} );
