import {
  act,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import Observation from "realmModels/Observation";
import useStore, { zustandStorage } from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut, TEST_JWT } from "tests/helpers/user";

// Entry points into ExploreV2 from other screens. The equivalent V1 flows live
// in Explore.test.js; delete this file's V1 sibling when V1 Explore goes away.

jest.unmock( "@react-navigation/native" );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en",
  species_count: faker.number.int( ),
  created_at: "2000-05-09T01:17:05-01:00",
  updated_at: "2000-05-09T01:17:05-01:00",
} );

const mockTaxon = factory( "LocalTaxon" );

const mockPlace = factory( "RemotePlace", {
  display_name: "Oakland, CA",
} );

const mockProject = factory( "RemoteProject", {
  title: "City Nature Challenge",
  project_type: "collection",
  place_id: mockPlace.id,
  project_observation_rules: [{
    operator: "observed_in_place?",
    operand_type: "Place",
    place: mockPlace,
  }],
} );

const mockObservations = [
  factory( "LocalObservation", {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
    user: mockUser,
    taxon: mockTaxon,
  } ),
];

const mockFetchUserLocation = jest.fn( ( ) => ( { latitude: 37, longitude: 34 } ) );
jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: ( ) => mockFetchUserLocation( ),
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

const enableExploreV2 = ( ) => act( ( ) => {
  useStore.setState( state => ( {
    featureFlagConfig: {
      ...state.featureFlagConfig,
      exploreV2Enabled: true,
    },
  } ) );
} );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
  inatjs.observations.speciesCounts.mockResolvedValue( makeResponse( [{
    count: 1,
    taxon: mockTaxon,
  }] ) );
  inatjs.observations.search.mockImplementation( ( params, _opts ) => {
    if ( params.user_id && !params.verifiable ) {
      return makeResponse( [] );
    }
    return makeResponse( mockObservations );
  } );
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [mockTaxon] ) );
  inatjs.projects.search.mockResolvedValue( makeResponse( [mockProject] ) );
  inatjs.projects.fetch.mockResolvedValue( makeResponse( [mockProject] ) );
  inatjs.projects.posts.mockResolvedValue( makeResponse( ) );
  inatjs.projects.membership.mockResolvedValue( makeResponse( ) );
  inatjs.places.fetch.mockResolvedValue( makeResponse( [mockPlace] ) );
} );

beforeEach( ( ) => {
  setStoreStateLayout( {
    isDefaultMode: false,
    isAllAddObsOptionsMode: true,
  } );
  zustandStorage.setItem( "exploreV2ObservationsLayout", "grid" );
  enableExploreV2( );
  mockFetchUserLocation.mockClear( );
  inatjs.observations.search.mockClear( );
  inatjs.observations.speciesCounts.mockClear( );
} );

afterEach( ( ) => {
  zustandStorage.removeItem( "exploreV2ObservationsLayout" );
} );

const actor = userEvent.setup( );

async function navigateToObsDetails( ) {
  await waitFor( ( ) => {
    expect( screen.getByText( /OBSERVATION/ ) ).toBeVisible( );
  } );
  const firstObservation = await screen.findByTestId(
    `ObsPressable.${mockObservations[0].uuid}`,
  );
  await actor.press( firstObservation );
}

const pressExploreBackButton = async ( ) => {
  const header = await screen.findByTestId( "ExploreV2Header" );
  await actor.press( within( header ).getByTestId( "BackButton" ) );
};

describe( "logged in", ( ) => {
  beforeEach( async ( ) => {
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    Observation.upsertRemoteObservations( mockObservations, global.mockRealms[__filename] );
  } );

  afterEach( async ( ) => {
    await signOut( { realm: global.mockRealms[__filename] } );
  } );

  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  describe( "from TaxonDetails", ( ) => {
    const navigateToTaxonDetails = async ( ) => {
      await navigateToObsDetails( );
      const taxonPressable = await screen.findByTestId(
        `ObsDetails.taxon.${mockObservations[0].taxon.id}`,
      );
      await actor.press( taxonPressable );
    };

    it( "searches the taxon worldwide without a nearby search, and goes back", async ( ) => {
      renderApp( );
      await navigateToTaxonDetails( );

      const exploreButton = await screen.findByLabelText(
        /See observations of this taxon in explore/,
      );
      await actor.press( exploreButton );

      await screen.findByTestId( "ExploreResults" );
      expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
        taxon_id: mockTaxon.id,
        verifiable: true,
      } ), {
        api_token: TEST_JWT,
      } );
      // Seeding the entry point's context at mount means Explore never searches
      // with its default state, i.e. no subject and nearby
      const exploreSearches = inatjs.observations.search.mock.calls
        .map( ( [params] ) => params )
        .filter( params => params.verifiable );
      expect( exploreSearches.length ).toBeGreaterThan( 0 );
      exploreSearches.forEach( params => {
        expect( params.taxon_id ).toBe( mockTaxon.id );
        expect( params.lat ).toBeUndefined( );
      } );

      const header = await screen.findByTestId( "ExploreV2Header" );
      expect( within( header ).getByTestId( "ExploreV2Header.subject" ) ).toBeVisible( );
      expect( within( header ).getByText( mockTaxon.name ) ).toBeVisible( );
      expect( within( header ).getByText( "Worldwide" ) ).toBeVisible( );

      await pressExploreBackButton( );

      expect( await screen.findByLabelText(
        /See observations of this taxon in explore/,
      ) ).toBeVisible( );
    } );
  } );

  describe( "from UserProfile", ( ) => {
    beforeEach( ( ) => {
      inatjs.users.fetch.mockResolvedValue( makeResponse( [mockUser] ) );
      inatjs.relationships.search.mockResolvedValue( makeResponse( { results: [] } ) );
    } );

    const navigateToUserProfile = async ( ) => {
      await navigateToObsDetails( );
      const userProfileButton = await screen.findByLabelText(
        `User ${mockObservations[0].user.login}`,
      );
      await actor.press( userProfileButton );
    };

    it( "searches the user's observations worldwide, and goes back", async ( ) => {
      renderApp( );
      await navigateToUserProfile( );

      await actor.press( await screen.findByLabelText(
        /See observations by this user in Explore/,
      ) );

      await screen.findByTestId( "ExploreResults" );
      expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
        user_id: mockUser.id,
        verifiable: true,
      } ), {
        api_token: TEST_JWT,
      } );
      const header = await screen.findByTestId( "ExploreV2Header" );
      expect( within( header ).getByText( mockUser.login ) ).toBeVisible( );

      await pressExploreBackButton( );

      expect( await screen.findByText( /JOURNAL POSTS/ ) ).toBeVisible( );
    } );
  } );

  const navigateToProjectDetails = async ( ) => {
    await actor.press( await screen.findByTestId( "Menu" ) );
    await actor.press( await screen.findByLabelText( "PROJECTS" ) );
    await actor.press( await screen.findByTestId( `Project.${mockProject.id}` ) );
    await screen.findByTestId( "project-details" );
  };

  describe( "from ProjectDetails", ( ) => {
    // A project's rules can cover many places, and the project's own `place` is
    // only one of them, so filtering by it would show a subset of the project's
    // observations and undercount what ProjectDetails displayed
    it( "searches the whole project, unfiltered by the project's place", async ( ) => {
      renderApp( );
      await navigateToProjectDetails( );

      await actor.press( await screen.findByLabelText(
        /See observations by this user in Explore/,
      ) );

      await screen.findByTestId( "ExploreResults" );
      const projectQueries = inatjs.observations.search.mock.calls
        .map( ( [params] ) => params )
        .filter( params => params.project_id === mockProject.id );
      expect( projectQueries.length ).toBeGreaterThan( 0 );
      projectQueries.forEach( params => {
        expect( params.place_id ).toBeUndefined( );
      } );
      const header = await screen.findByTestId( "ExploreV2Header" );
      expect( within( header ).getByText( mockProject.title ) ).toBeVisible( );
      expect( within( header ).getByText( "Worldwide" ) ).toBeVisible( );
    } );

    it( "opens the species tab worldwide from the species count", async ( ) => {
      renderApp( );
      await navigateToProjectDetails( );

      await actor.press( await screen.findByLabelText(
        /See species observed by this user in Explore/,
      ) );

      await screen.findByTestId( "ExploreResults" );
      expect( await screen.findByTestId( "ExploreV2SpeciesList" ) ).toBeVisible( );
      const speciesQueries = inatjs.observations.speciesCounts.mock.calls
        .map( ( [params] ) => params )
        .filter( params => params.project_id === mockProject.id );
      expect( speciesQueries.length ).toBeGreaterThan( 0 );
      speciesQueries.forEach( params => {
        expect( params.place_id ).toBeUndefined( );
      } );
      const header = await screen.findByTestId( "ExploreV2Header" );
      expect( within( header ).getByText( mockProject.title ) ).toBeVisible( );
      expect( within( header ).getByText( "Worldwide" ) ).toBeVisible( );
    } );
  } );

  describe( "from ProjectRequirements", ( ) => {
    it( "searches a location rule's place with no subject", async ( ) => {
      renderApp( );
      await navigateToProjectDetails( );

      await actor.press( await screen.findByText( /VIEW PROJECT REQUIREMENTS/ ) );
      await actor.press( await screen.findByText( mockPlace.display_name ) );

      await screen.findByTestId( "ExploreResults" );
      expect( inatjs.observations.search ).toHaveBeenCalledWith( expect.objectContaining( {
        place_id: mockPlace.id,
        verifiable: true,
      } ), {
        api_token: TEST_JWT,
      } );
      const header = await screen.findByTestId( "ExploreV2Header" );
      expect( within( header ).queryByTestId( "ExploreV2Header.subject" ) ).toBeNull( );
      expect( within( header ).getByText( mockPlace.display_name ) ).toBeVisible( );
    } );
  } );
} );
