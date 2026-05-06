import {
  defaultExploreV2Location,
  EXPLORE_V2_ACTION,
  EXPLORE_V2_PLACE_MODE,
  EXPLORE_V2_SORT,
  exploreV2Reducer,
  initialExploreV2State,
} from "providers/ExploreV2Context";
import fetchCoarseUserLocation from "sharedHelpers/fetchCoarseUserLocation";

jest.mock( "sharedHelpers/fetchCoarseUserLocation", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

describe( "initialExploreV2State", ( ) => {
  it( "starts with no subject, UNINITIALIZED placeMode, newest-upload sort, empty filters", ( ) => {
    expect( initialExploreV2State.subject ).toBeNull( );
    expect( initialExploreV2State.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.UNINITIALIZED );
    expect( initialExploreV2State.sortBy ).toBe( EXPLORE_V2_SORT.DATE_UPLOADED_NEWEST );
    expect( initialExploreV2State.filters ).toEqual( {} );
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
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
          lat: 1,
          lng: 2,
          radius: 3,
        },
        sortBy: EXPLORE_V2_SORT.MOST_FAVED,
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
    it( "SET_LOCATION_NEARBY transitions from PLACE and drops place", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
          place: { id: 1 },
        },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY,
        lat: 37.5,
        lng: -122.1,
        radius: 1,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.NEARBY );
      expect( next.location.lat ).toBe( 37.5 );
      expect( next.location.lng ).toBe( -122.1 );
      expect( next.location.radius ).toBe( 1 );
      expect( next.location.place ).toBeUndefined( );
    } );

    it( "SET_LOCATION_WORLDWIDE transitions from NEARBY and drops coords", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
          lat: 1,
          lng: 1,
          radius: 1,
        },
      };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.WORLDWIDE );
      expect( next.location.lat ).toBeUndefined( );
      expect( next.location.lng ).toBeUndefined( );
      expect( next.location.radius ).toBeUndefined( );
    } );

    it( "SET_LOCATION_PLACE transitions from NEARBY and drops coords", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
          lat: 1,
          lng: 1,
          radius: 1,
        },
      };
      const place = { id: 5, display_name: "Oakland" };
      const next = exploreV2Reducer( state, {
        type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE,
        place,
      } );
      expect( next.location.placeMode ).toBe( EXPLORE_V2_PLACE_MODE.PLACE );
      expect( next.location.place ).toEqual( place );
      expect( next.location.lat ).toBeUndefined( );
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
        location: { placeMode: EXPLORE_V2_PLACE_MODE.UNINITIALIZED },
        sortBy: EXPLORE_V2_SORT.MOST_FAVED,
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
        sortBy: EXPLORE_V2_SORT.DATE_OBSERVED_NEWEST,
      } );
      expect( next.sortBy ).toBe( EXPLORE_V2_SORT.DATE_OBSERVED_NEWEST );
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
        sortBy: EXPLORE_V2_SORT.MOST_FAVED,
      };
      const next = exploreV2Reducer( state, { type: EXPLORE_V2_ACTION.RESET } );
      expect( next ).toEqual( initialExploreV2State );
    } );
  } );
} );

describe( "defaultExploreV2Location", ( ) => {
  beforeEach( ( ) => {
    fetchCoarseUserLocation.mockReset( );
  } );

  it( "returns NEARBY with radius 1 when a location is available", async ( ) => {
    fetchCoarseUserLocation.mockResolvedValueOnce( { latitude: 37.5, longitude: -122.1 } );
    const result = await defaultExploreV2Location( );
    expect( result ).toEqual( {
      placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
      lat: 37.5,
      lng: -122.1,
      radius: 1,
    } );
  } );

  it( "returns WORLDWIDE when fetchCoarseUserLocation returns null", async ( ) => {
    fetchCoarseUserLocation.mockResolvedValueOnce( null );
    const result = await defaultExploreV2Location( );
    expect( result ).toEqual( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } );
  } );
} );
