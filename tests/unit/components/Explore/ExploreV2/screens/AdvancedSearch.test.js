import { screen, userEvent } from "@testing-library/react-native";
import { OBSERVATIONS_TAB } from "appConstants/tabs";
import AdvancedSearch from "components/Explore/ExploreV2/screens/AdvancedSearch";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { DATE_OBSERVED, WILD_STATUS } from "providers/ExploreContext";
import {
  defaultExploreV2Filters,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import React from "react";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { renderComponent } from "tests/helpers/render";

const mockGoBack = jest.fn( );
const mockPopTo = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      goBack: mockGoBack,
      navigate: jest.fn( ),
      popTo: mockPopTo,
      push: jest.fn( ),
      canGoBack: ( ) => true,
    } ),
  };
} );

const mockDispatch = jest.fn( );
jest.mock( "providers/ExploreV2Context", ( ) => {
  const actual = jest.requireActual( "providers/ExploreV2Context" );
  return {
    ...actual,
    useExploreV2: jest.fn( ),
  };
} );
const { useExploreV2 } = require( "providers/ExploreV2Context" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useCurrentUser = require( "sharedHooks/useCurrentUser" ).default;

jest.mock( "sharedHooks/useIconicTaxa", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
const useIconicTaxa = require( "sharedHooks/useIconicTaxa" ).default;

const CURRENT_USER = {
  id: 99,
  login: "tester",
  observations_count: 42,
  prefers_common_names: true,
  prefers_scientific_name_first: false,
};

const TAXON = {
  id: 745,
  name: "Silphium perfoliatum",
  preferred_common_name: "Cup Plant",
  rank: "species",
  rank_level: 10,
};

const BIRDS = {
  id: 3,
  name: "Aves",
  preferred_common_name: "Birds",
  rank: "class",
  rank_level: 50,
  iconic_taxon_name: "Aves",
};

const USER = { id: 7, login: "seth_msp", observations_count: 5 };
const PROJECT = {
  id: 9,
  title: "InverteFest",
  project_type: "collection",
  rule_preferences: [],
  icon: "https://example.com/p.jpg",
};
const PLACE = { id: 1, display_name: "Monterey, CA, US" };
const BOUNDS = {
  swlat: 1, swlng: 2, nelat: 3, nelng: 4,
};

// Stands in for the Realm collection of iconic taxa the chooser looks up by name.
const iconicTaxaCollection = taxa => ( {
  filtered: ( _query, name ) => taxa.filter(
    taxon => taxon.name.toLowerCase( ) === name.toLowerCase( ),
  ),
  length: taxa.length,
} );

const setExploreState = ( { filters, ...overrides } = {} ) => {
  useExploreV2.mockReturnValue( {
    dispatch: mockDispatch,
    state: {
      ...initialExploreV2State,
      ...overrides,
      filters: { ...defaultExploreV2Filters, ...filters },
    },
  } );
};

const actor = userEvent.setup( );

const t = key => i18next.t( key );

const pressSearch = ( ) => actor.press( screen.getByTestId( "AdvancedSearch.searchButton" ) );

const qualityGrade = key => screen.getByRole( "radio", { name: t( key ) } );

const committedFilters = ( ) => mockDispatch.mock.calls
  .map( ( [action] ) => action )
  .find( action => action.type === EXPLORE_V2_ACTION.SET_FILTERS )
  ?.filters;

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  mockGoBack.mockClear( );
  mockPopTo.mockClear( );
  mockDispatch.mockClear( );
  useCurrentUser.mockReturnValue( CURRENT_USER );
  useIconicTaxa.mockReturnValue( iconicTaxaCollection( [BIRDS] ) );
  setExploreState( );
} );

describe( "AdvancedSearch screen", ( ) => {
  it( "renders a section for every filter", ( ) => {
    renderComponent( <AdvancedSearch /> );

    expect( screen.getByTestId( "AdvancedSearch" ) ).toBeVisible( );
    [
      "TAXON",
      "LOCATION",
      "SORT-BY",
      "QUALITY-GRADE",
      "USER",
      "PROJECT",
      "TAXONOMIC-RANKS",
      "DATE-OBSERVED",
      "DATE-UPLOADED",
      "MEDIA",
      "ESTABLISHMENT-MEANS",
      "WILD-STATUS",
      "REVIEWED",
      "PHOTO-LICENSING",
    ].forEach( heading => {
      expect( screen.getByText( t( heading ) ) ).toBeVisible( );
    } );
  } );

  it( "hides the reviewed section when logged out", ( ) => {
    useCurrentUser.mockReturnValue( null );
    renderComponent( <AdvancedSearch /> );

    expect( screen.queryByText( t( "REVIEWED" ) ) ).toBeNull( );
    expect( screen.getByText( t( "WILD-STATUS" ) ) ).toBeVisible( );
  } );

  it( "closes without committing anything", async ( ) => {
    renderComponent( <AdvancedSearch /> );

    await actor.press( screen.getByTestId( "AdvancedSearch.back" ) );

    expect( mockGoBack ).toHaveBeenCalled( );
    expect( mockDispatch ).not.toHaveBeenCalled( );
  } );

  describe( "seeding from the current explore search", ( ) => {
    it( "shows the taxon subject, place, and sort order already in effect", ( ) => {
      setExploreState( {
        subject: { type: "taxon", taxon: TAXON },
        location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( "Cup Plant" ) ).toBeVisible( );
      expect( screen.getByText( PLACE.display_name ) ).toBeVisible( );
      expect( screen.getByText( t( "DATE-OBSERVED-OLDEST" ) ) ).toBeVisible( );
      expect( screen.queryByText( t( "SEARCH-FOR-A-TAXON" ) ) ).toBeNull( );
    } );

    it( "checks the quality grades that are in effect", ( ) => {
      renderComponent( <AdvancedSearch /> );

      expect( qualityGrade( "Research-Grade--quality-grade" ) ).toBeChecked( );
      expect( qualityGrade( "Needs-ID--quality-grade" ) ).toBeChecked( );
      expect( qualityGrade( "Casual--quality-grade" ) ).not.toBeChecked( );
    } );

    it( "shows a user subject in the user section", ( ) => {
      setExploreState( { subject: { type: "user", user: USER } } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( USER.login ) ).toBeVisible( );
      expect( screen.queryByText( t( "FILTER-BY-A-USER" ) ) ).toBeNull( );
    } );

    it( "shows a project subject in the project section", ( ) => {
      setExploreState( { subject: { type: "project", project: PROJECT } } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( PROJECT.title ) ).toBeVisible( );
      expect( screen.queryByText( t( "FILTER-BY-A-PROJECT" ) ) ).toBeNull( );
    } );

    it( "shows an excluded user under an all-users-except heading", ( ) => {
      setExploreState( { filters: { excludeUser: USER } } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( t( "ALL-USERS-EXCEPT" ) ) ).toBeVisible( );
      expect( screen.queryByText( t( "USER" ) ) ).toBeNull( );
      expect( screen.getByText( USER.login ) ).toBeVisible( );
    } );

    it( "shows the unknown subject as an unknown taxon", ( ) => {
      setExploreState( { subject: { type: "unknown" } } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( t( "Unknown--taxon" ) ) ).toBeVisible( );
    } );
  } );

  describe( "editing the taxon", ( ) => {
    it( "removes a carried taxon", async ( ) => {
      setExploreState( { subject: { type: "taxon", taxon: TAXON } } );
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByLabelText( t( "Remove-taxon-filter" ) ) );

      expect( screen.queryByText( "Cup Plant" ) ).toBeNull( );
      expect( screen.getByText( t( "SEARCH-FOR-A-TAXON" ) ) ).toBeVisible( );

      await pressSearch( );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );
    } );

    it( "picks an iconic taxon from the chooser", async ( ) => {
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByTestId( "INatIconButton.IconicTaxonButton.aves" ) );

      expect( screen.getByText( "Birds" ) ).toBeVisible( );

      await pressSearch( );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_SUBJECT,
        subject: {
          type: "taxon",
          taxon: expect.objectContaining( { id: BIRDS.id, name: BIRDS.name } ),
        },
      } );
    } );

    it( "deselects an iconic taxon that is tapped again", async ( ) => {
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByTestId( "INatIconButton.IconicTaxonButton.aves" ) );
      expect( screen.getByText( "Birds" ) ).toBeVisible( );

      await actor.press( screen.getByTestId( "INatIconButton.IconicTaxonButton.aves" ) );

      expect( screen.queryByText( "Birds" ) ).toBeNull( );

      await pressSearch( );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );
    } );

    it( "removes a carried unknown subject", async ( ) => {
      setExploreState( { subject: { type: "unknown" } } );
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByLabelText( t( "Remove-taxon-filter" ) ) );

      expect( screen.queryByText( t( "Unknown--taxon" ) ) ).toBeNull( );
      expect( screen.getByText( t( "SEARCH-FOR-A-TAXON" ) ) ).toBeVisible( );

      await pressSearch( );
      expect( mockDispatch ).toHaveBeenCalledWith( { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );
    } );
  } );

  describe( "editing filters", ( ) => {
    it( "commits a quality grade the user checked", async ( ) => {
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByText( t( "Casual--quality-grade" ) ) );
      await pressSearch( );

      expect( committedFilters( ) ).toMatchObject( { casual: true } );
    } );

    it( "commits a single-select filter the user chose", async ( ) => {
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByText( t( "Sounds" ) ) );
      await pressSearch( );

      expect( committedFilters( ) ).toMatchObject( { media: "SOUNDS" } );
    } );

    it( "includes casual observations when the user filters for captive", async ( ) => {
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByText( t( "Captive-Cultivated" ) ) );
      await pressSearch( );

      expect( committedFilters( ) ).toMatchObject( {
        wildStatus: WILD_STATUS.CAPTIVE,
        casual: true,
      } );
    } );

    it( "removes a carried user filter", async ( ) => {
      setExploreState( { filters: { user: USER } } );
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByLabelText( t( "Remove-user-filter" ) ) );

      expect( screen.getByText( t( "FILTER-BY-A-USER" ) ) ).toBeVisible( );

      await pressSearch( );
      expect( committedFilters( ) ).toMatchObject( { user: null } );
    } );

    it( "removes a carried project filter", async ( ) => {
      setExploreState( { filters: { project: PROJECT } } );
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByLabelText( t( "Remove-project-filter" ) ) );

      expect( screen.getByText( t( "FILTER-BY-A-PROJECT" ) ) ).toBeVisible( );

      await pressSearch( );
      expect( committedFilters( ) ).toMatchObject( { project: null } );
    } );
  } );

  describe( "committing the search", ( ) => {
    it( "commits the unchanged search and returns to the results", async ( ) => {
      setExploreState( {
        subject: { type: "taxon", taxon: TAXON },
        location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      } );
      renderComponent( <AdvancedSearch /> );

      await pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_SUBJECT,
        subject: { type: "taxon", taxon: TAXON },
      } );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
        place: PLACE,
      } );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_SORT,
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      } );
      expect( committedFilters( ) ).toEqual( defaultExploreV2Filters );
      // advanced search always lands on the observations tab
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_ACTIVE_TAB,
        tab: OBSERVATIONS_TAB,
      } );
      expect( mockPopTo ).toHaveBeenCalledWith( "ExploreResults" );
    } );

    it( "carries a nearby search through untouched", async ( ) => {
      setExploreState( { location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY } } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( t( "Nearby" ) ) ).toBeVisible( );

      await pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
      } );
    } );

    it( "carries a map area search through untouched", async ( ) => {
      setExploreState( {
        location: { placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA, bounds: BOUNDS },
      } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( t( "Map-Area" ) ) ).toBeVisible( );

      await pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_LOCATION_MAP_AREA,
        bounds: BOUNDS,
      } );
    } );

    it( "clears a carried subject that the user replaced with a user filter", async ( ) => {
      setExploreState( {
        subject: { type: "unobserved", user: CURRENT_USER },
        filters: { user: USER },
      } );
      renderComponent( <AdvancedSearch /> );

      // Editing the user section supersedes the unobserved subject.
      await actor.press( screen.getByLabelText( t( "Remove-user-filter" ) ) );
      await pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );
    } );
  } );

  describe( "reset", ( ) => {
    it( "restores the default search without committing it", async ( ) => {
      setExploreState( {
        subject: { type: "taxon", taxon: TAXON },
        location: { placeMode: EXPLORE_V2_PLACE_MODE.PLACE, place: PLACE },
        filters: { user: USER },
      } );
      renderComponent( <AdvancedSearch /> );

      await actor.press( screen.getByTestId( "AdvancedSearch.back.reset" ) );

      expect( screen.queryByText( "Cup Plant" ) ).toBeNull( );
      expect( screen.queryByText( PLACE.display_name ) ).toBeNull( );
      expect( screen.getByText( t( "Worldwide" ) ) ).toBeVisible( );
      expect( screen.getByText( t( "FILTER-BY-A-USER" ) ) ).toBeVisible( );
      expect( mockDispatch ).not.toHaveBeenCalled( );

      await pressSearch( );

      expect( mockDispatch ).toHaveBeenCalledWith( { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );
      expect( mockDispatch ).toHaveBeenCalledWith( {
        type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( committedFilters( ) ).toEqual( defaultExploreV2Filters );
    } );
  } );

  describe( "searches that cannot run", ( ) => {
    it( "blocks the search when the observed date range ends before it starts", async ( ) => {
      setExploreState( {
        filters: {
          dateObserved: DATE_OBSERVED.DATE_RANGE,
          d1: "2024-03-01",
          d2: "2024-02-01",
        },
      } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByText( t( "Start-must-be-before-end" ) ) ).toBeVisible( );
      expect( screen.getByTestId( "AdvancedSearch.searchButton" ) ).toBeDisabled( );

      await pressSearch( );
      expect( mockDispatch ).not.toHaveBeenCalled( );
      expect( mockPopTo ).not.toHaveBeenCalled( );
    } );

    it( "blocks the search when months are being filtered but none are checked", async ( ) => {
      setExploreState( {
        filters: { dateObserved: DATE_OBSERVED.MONTHS, months: [] },
      } );
      renderComponent( <AdvancedSearch /> );

      expect( screen.getByTestId( "AdvancedSearch.searchButton" ) ).toBeDisabled( );

      await actor.press( screen.getByText( t( "June" ) ) );

      expect( screen.getByTestId( "AdvancedSearch.searchButton" ) ).not.toBeDisabled( );

      await pressSearch( );
      expect( committedFilters( ) ).toMatchObject( { months: [6] } );
    } );
  } );
} );
