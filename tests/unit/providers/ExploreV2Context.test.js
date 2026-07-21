import {
  defaultExploreV2Filters,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  exploreV2Reducer,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";

describe( "initialExploreV2State", ( ) => {
  it( "starts with no subject, NEARBY placeMode, newest-upload sort, default filters", ( ) => {
    expect( initialExploreV2State.subject ).toBeNull( );
    expect( initialExploreV2State.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.NEARBY );
    expect( initialExploreV2State.sortBy ).toBe( OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST );
    expect( initialExploreV2State.filters ).toEqual( defaultExploreV2Filters );
  } );
} );

describe( "exploreV2Reducer", ( ) => {
  describe( EXPLORE_V2_ACTION.SET_SUBJECT, ( ) => {
    it( "sets a taxon subject, replacing any prior subject", ( ) => {
      const taxon = { id: 42, name: "Foo" };
      const state = {
        ...initialExploreV2State,
        subject: { type: "user", user: { id: 1 } },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_SUBJECT,
        subject: { type: "taxon", taxon },
      } );
      expect( next.subject ).toEqual( { type: "taxon", taxon } );
    } );

    it( "preserves location, sortBy, and filters when changing subject", ( ) => {
      const state = {
        subject: null,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
        filters: { quality_grade: "research" },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_SUBJECT,
        subject: { type: "taxon", taxon: { id: 1 } },
      } );
      expect( next.location ).toEqual( state.location );
      expect( next.sortBy ).toBe( state.sortBy );
      expect( next.filters ).toEqual( state.filters );
    } );
  } );

  describe( EXPLORE_V2_ACTION.CLEAR_SUBJECT, ( ) => {
    it( "clears the selected subject", ( ) => {
      const state = {
        ...initialExploreV2State,
        subject: { type: "taxon", taxon: { id: 99 } },
      };
      const next = exploreV2Reducer( state, { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );
      expect( next.subject ).toBeNull( );
    } );
  } );

  describe( "location actions", ( ) => {
    it( "SET_LOCATION_NEARBY transitions from PLACE and drops place (no coords stored)", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
          place: { id: 1 },
        },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.NEARBY );
      expect( next.location.lat ).toBeUndefined( );
      expect( next.location.place ).toBeUndefined( );
    } );

    it( "SET_LOCATION_WORLDWIDE transitions from NEARBY", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.WORLDWIDE );
      expect( next.location.lat ).toBeUndefined( );
    } );

    it( "SET_LOCATION_PLACE transitions from NEARBY", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
      };
      const place = { id: 5, display_name: "Oakland" };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
        place,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.PLACE );
      expect( next.location.place ).toEqual( place );
    } );

    it( "SET_LOCATION_PLACE replaces an existing place", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
          place: { id: 1, display_name: "Oakland" },
        },
      };
      const place = { id: 2, display_name: "Berkeley" };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
        place,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.PLACE );
      expect( next.location.place ).toEqual( place );
    } );

    it( "preserves subject, sortBy, and filters when changing location", ( ) => {
      const state = {
        subject: { type: "taxon", taxon: { id: 42 } },
        location: { placeMode: EXPLORE_V2_PLACE_MODE.NEARBY },
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
        filters: { quality_grade: "research" },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( next.subject ).toEqual( state.subject );
      expect( next.sortBy ).toBe( state.sortBy );
      expect( next.filters ).toEqual( state.filters );
    } );
  } );

  describe( EXPLORE_V2_ACTION.SET_SORT, ( ) => {
    it( "updates sortBy", ( ) => {
      const next = exploreV2Reducer( initialExploreV2State, {
        type: EXPLORE_V2_ACTION.SET_SORT,
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
      } );
      expect( next.sortBy ).toBe( OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST );
    } );
  } );

  describe( EXPLORE_V2_ACTION.SET_FILTERS, ( ) => {
    it( "replaces filters with the provided object", ( ) => {
      const state = {
        ...initialExploreV2State,
        filters: { quality_grade: "research" },
      };
      const filters = { quality_grade: "needs_id", iconic_taxa: ["Aves"] };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_FILTERS,
        filters,
      } );
      expect( next.filters ).toEqual( filters );
    } );
  } );

  describe( EXPLORE_V2_ACTION.RESET, ( ) => {
    it( "returns initial state", ( ) => {
      const state = {
        ...initialExploreV2State,
        subject: { type: "taxon", taxon: { id: 1 } },
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
      };
      const next = exploreV2Reducer( state, { type: EXPLORE_V2_ACTION.RESET } );
      expect( next ).toEqual( initialExploreV2State );
    } );
  } );
} );
