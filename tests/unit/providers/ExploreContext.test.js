import { SPECIES_TAB } from "appConstants/tabs";
import {
  defaultExploreFilters,
  EXPLORE_ACTION,
  EXPLORE_PLACE_MODE,
  exploreReducer,
  initialExploreState,
  initialStateFromEntryParams,
} from "providers/ExploreContext";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";

describe( "initialExploreState", ( ) => {
  it( "starts with no subject, NEARBY placeMode, newest-upload sort, default filters", ( ) => {
    expect( initialExploreState.subject ).toBeNull( );
    expect( initialExploreState.location.placeMode ).toBe( EXPLORE_PLACE_MODE.NEARBY );
    expect( initialExploreState.sortBy ).toBe( OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST );
    expect( initialExploreState.speciesSortBy ).toBe( SPECIES_SORT.COUNT_DESC );
    expect( initialExploreState.filters ).toEqual( defaultExploreFilters );
  } );
} );

describe( "initialStateFromEntryParams", ( ) => {
  it( "returns the initial state without params, or with a null subject", ( ) => {
    expect( initialStateFromEntryParams( undefined ) ).toEqual( initialExploreState );
    expect( initialStateFromEntryParams( {} ) ).toEqual( initialExploreState );
    expect( initialStateFromEntryParams( { subject: null } ).subject ).toBeNull( );
  } );

  it( "seeds subject, location, and tab from an entry point, leaving sort and filters", ( ) => {
    const subject = { type: "taxon", taxon: { id: 12345, name: "Danaus plexippus" } };
    const state = initialStateFromEntryParams( {
      subject,
      location: { placeMode: EXPLORE_PLACE_MODE.PLACE, place: { id: 55 } },
      activeTab: SPECIES_TAB,
    } );
    expect( state.subject ).toEqual( subject );
    expect( state.location ).toEqual( {
      placeMode: EXPLORE_PLACE_MODE.PLACE,
      place: { id: 55 },
    } );
    expect( state.activeTab ).toBe( SPECIES_TAB );
    expect( state.sortBy ).toBe( initialExploreState.sortBy );
    expect( state.speciesSortBy ).toBe( initialExploreState.speciesSortBy );
    expect( state.filters ).toEqual( defaultExploreFilters );
  } );

  const search = {
    subject: { type: "taxon", taxon: { id: 1, name: "Plantae" } },
    location: { placeMode: EXPLORE_PLACE_MODE.WORLDWIDE },
    sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
    speciesSortBy: SPECIES_SORT.COUNT_ASC,
    filters: { ...defaultExploreFilters, casual: true },
  };

  it( "seeds the whole search from the search param", ( ) => {
    expect( initialStateFromEntryParams( { search } ) ).toEqual( {
      ...initialExploreState,
      ...search,
    } );
  } );

  it( "applies activeTab on top of a search", ( ) => {
    expect( initialStateFromEntryParams( { search, activeTab: SPECIES_TAB } ) ).toEqual( {
      ...initialExploreState,
      ...search,
      activeTab: SPECIES_TAB,
    } );
  } );
} );

describe( "exploreReducer", ( ) => {
  describe( EXPLORE_ACTION.SET_SUBJECT, ( ) => {
    it( "sets a taxon subject, replacing any prior subject", ( ) => {
      const taxon = { id: 42, name: "Foo" };
      const state = {
        ...initialExploreState,
        subject: { type: "user", user: { id: 1 } },
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_SUBJECT,
        subject: { type: "taxon", taxon },
      } );
      expect( next.subject ).toEqual( { type: "taxon", taxon } );
    } );

    it( "preserves location, sorts, and filters when changing subject", ( ) => {
      const state = {
        subject: null,
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
        speciesSortBy: SPECIES_SORT.COUNT_ASC,
        filters: { quality_grade: "research" },
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_SUBJECT,
        subject: { type: "taxon", taxon: { id: 1 } },
      } );
      expect( next.location ).toEqual( state.location );
      expect( next.sortBy ).toBe( state.sortBy );
      expect( next.speciesSortBy ).toBe( state.speciesSortBy );
      expect( next.filters ).toEqual( state.filters );
    } );
  } );

  describe( EXPLORE_ACTION.CLEAR_SUBJECT, ( ) => {
    it( "clears the selected subject", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "taxon", taxon: { id: 99 } },
      };
      const next = exploreReducer( state, { type: EXPLORE_ACTION.CLEAR_SUBJECT } );
      expect( next.subject ).toBeNull( );
    } );
  } );

  describe( "location actions", ( ) => {
    it( "SET_LOCATION_NEARBY transitions from PLACE and drops place (no coords stored)", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.PLACE,
          place: { id: 1 },
        },
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_NEARBY,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_PLACE_MODE.NEARBY );
      expect( next.location.lat ).toBeUndefined( );
      expect( next.location.place ).toBeUndefined( );
    } );

    it( "SET_LOCATION_WORLDWIDE transitions from NEARBY", ( ) => {
      const state = {
        ...initialExploreState,
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_PLACE_MODE.WORLDWIDE );
      expect( next.location.lat ).toBeUndefined( );
    } );

    it( "SET_LOCATION_PLACE transitions from NEARBY", ( ) => {
      const state = {
        ...initialExploreState,
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
      };
      const place = { id: 5, display_name: "Oakland" };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_PLACE,
        place,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_PLACE_MODE.PLACE );
      expect( next.location.place ).toEqual( place );
    } );

    it( "SET_LOCATION_PLACE replaces an existing place", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.PLACE,
          place: { id: 1, display_name: "Oakland" },
        },
      };
      const place = { id: 2, display_name: "Berkeley" };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_PLACE,
        place,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_PLACE_MODE.PLACE );
      expect( next.location.place ).toEqual( place );
    } );

    it( "SET_LOCATION_MAP_AREA stores the bounding box, dropping the prior place", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.PLACE,
          place: { id: 5, display_name: "Oakland" },
        },
      };
      const bounds = {
        swlat: 10, swlng: 20, nelat: 30, nelng: 40,
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_MAP_AREA,
        bounds,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_PLACE_MODE.MAP_AREA );
      expect( next.location.bounds ).toEqual( bounds );
      expect( next.location.place ).toBeUndefined( );
    } );

    it( "SET_LOCATION_WORLDWIDE drops a prior map area's bounds", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.MAP_AREA,
          bounds: {
            swlat: 10, swlng: 20, nelat: 30, nelng: 40,
          },
        },
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_PLACE_MODE.WORLDWIDE );
      expect( next.location.bounds ).toBeUndefined( );
    } );

    it( "preserves subject, sorts, and filters when changing location", ( ) => {
      const state = {
        subject: { type: "taxon", taxon: { id: 42 } },
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
        speciesSortBy: SPECIES_SORT.COUNT_ASC,
        filters: { quality_grade: "research" },
      };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( next.subject ).toEqual( state.subject );
      expect( next.sortBy ).toBe( state.sortBy );
      expect( next.speciesSortBy ).toBe( state.speciesSortBy );
      expect( next.filters ).toEqual( state.filters );
    } );
  } );

  describe( EXPLORE_ACTION.SET_SORT, ( ) => {
    it( "updates sortBy", ( ) => {
      const next = exploreReducer( initialExploreState, {
        type: EXPLORE_ACTION.SET_SORT,
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
      } );
      expect( next.sortBy ).toBe( OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST );
    } );
  } );

  describe( EXPLORE_ACTION.SET_SPECIES_SORT, ( ) => {
    it( "updates speciesSortBy without touching sortBy", ( ) => {
      const next = exploreReducer( initialExploreState, {
        type: EXPLORE_ACTION.SET_SPECIES_SORT,
        speciesSortBy: SPECIES_SORT.COUNT_ASC,
      } );
      expect( next.speciesSortBy ).toBe( SPECIES_SORT.COUNT_ASC );
      expect( next.sortBy ).toBe( initialExploreState.sortBy );
    } );
  } );

  describe( EXPLORE_ACTION.SET_FILTERS, ( ) => {
    it( "replaces filters with the provided object", ( ) => {
      const state = {
        ...initialExploreState,
        filters: { quality_grade: "research" },
      };
      const filters = { quality_grade: "needs_id", iconic_taxa: ["Aves"] };
      const next = exploreReducer( state, {
        type: EXPLORE_ACTION.SET_FILTERS,
        filters,
      } );
      expect( next.filters ).toEqual( filters );
    } );
  } );

  describe( EXPLORE_ACTION.APPLY_SEARCH, ( ) => {
    const PLACE = { id: 1, display_name: "Minnesota, US", place_type: 9 };
    // Every field differs from the initial state, so a field left unapplied shows up
    const search = {
      subject: { type: "taxon", taxon: { id: 12, name: "Opuntia fragilis" } },
      location: { placeMode: EXPLORE_PLACE_MODE.PLACE, place: PLACE },
      sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      speciesSortBy: SPECIES_SORT.COUNT_ASC,
      filters: { ...defaultExploreFilters, casual: true },
    };

    it( "applies the subject, location, both sort orders, and the filters at once", ( ) => {
      const next = exploreReducer( initialExploreState, {
        type: EXPLORE_ACTION.APPLY_SEARCH,
        search,
      } );
      expect( next ).toEqual( { ...initialExploreState, ...search, appliedSearchCount: 1 } );
    } );

    it( "clears the subject for a search that has none", ( ) => {
      const next = exploreReducer(
        { ...initialExploreState, subject: search.subject },
        { type: EXPLORE_ACTION.APPLY_SEARCH, search: { ...search, subject: null } },
      );
      expect( next.subject ).toBeNull( );
    } );

    it( "keeps bookkeeping fields on a saved search out of the state", ( ) => {
      const next = exploreReducer( initialExploreState, {
        type: EXPLORE_ACTION.APPLY_SEARCH,
        search: { ...search, key: "abc", savedAt: 1 },
      } );
      expect( next ).not.toHaveProperty( "key" );
      expect( next ).not.toHaveProperty( "savedAt" );
    } );

    it( "counts every applied search, so applying one twice still reads as a change", ( ) => {
      const first = exploreReducer( initialExploreState, {
        type: EXPLORE_ACTION.APPLY_SEARCH,
        search,
      } );
      const second = exploreReducer( first, {
        type: EXPLORE_ACTION.APPLY_SEARCH,
        search,
      } );
      expect( first.appliedSearchCount ).toBe( 1 );
      expect( second.appliedSearchCount ).toBe( 2 );
    } );

    it( "does not count a map area the user chose on the map", ( ) => {
      const applied = exploreReducer( initialExploreState, {
        type: EXPLORE_ACTION.APPLY_SEARCH,
        search,
      } );
      const redone = exploreReducer( applied, {
        type: EXPLORE_ACTION.SET_LOCATION_MAP_AREA,
        bounds: {
          swlat: 1, swlng: 2, nelat: 3, nelng: 4,
        },
      } );
      expect( redone.appliedSearchCount ).toBe( applied.appliedSearchCount );
    } );
  } );

  describe( EXPLORE_ACTION.RESET, ( ) => {
    it( "returns initial state", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "taxon", taxon: { id: 1 } },
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
        speciesSortBy: SPECIES_SORT.COUNT_ASC,
      };
      const next = exploreReducer( state, { type: EXPLORE_ACTION.RESET } );
      expect( next ).toEqual( initialExploreState );
    } );
  } );
} );
