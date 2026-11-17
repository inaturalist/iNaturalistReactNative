import buildExploreQueryParams
  from "components/Explore/helpers/buildQueryParams";
import {
  EXPLORE_PLACE_MODE,
  initialExploreState,
} from "providers/ExploreContext";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";

describe( "buildExploreQueryParams", ( ) => {
  describe( "subject filter", ( ) => {
    it( "maps a selected taxon to taxon_id", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "taxon", taxon: { id: 42 } },
      };
      const params = buildExploreQueryParams( state );
      expect( params.taxon_id ).toBe( 42 );
      expect( params.user_id ).toBeUndefined( );
      expect( params.project_id ).toBeUndefined( );
    } );

    it( "maps a selected user to user_id", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "user", user: { id: 7 } },
      };
      const params = buildExploreQueryParams( state );
      expect( params.user_id ).toBe( 7 );
      expect( params.taxon_id ).toBeUndefined( );
    } );

    it( "maps a selected project to project_id", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "project", project: { id: 12 } },
      };
      const params = buildExploreQueryParams( state );
      expect( params.project_id ).toBe( 12 );
    } );

    it( "maps an unobserved subject to unobserved_by_user_id", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "unobserved", user: { id: 99 } },
      };
      const params = buildExploreQueryParams( state );
      expect( params.unobserved_by_user_id ).toBe( 99 );
      expect( params.user_id ).toBeUndefined( );
      expect( params.taxon_id ).toBeUndefined( );
    } );

    it( "maps an unknown subject to iconic_taxa=[unknown]", ( ) => {
      const state = {
        ...initialExploreState,
        subject: { type: "unknown" },
      };
      const params = buildExploreQueryParams( state );
      expect( params.iconic_taxa ).toEqual( ["unknown"] );
      expect( params.identified ).toBe( false );
      expect( params.taxon_id ).toBeUndefined( );
      expect( params.verifiable ).toBe( true );
    } );
  } );

  describe( "location", ( ) => {
    it( "includes lat/lng/radius in NEARBY mode when coords are resolved", ( ) => {
      const state = {
        ...initialExploreState,
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
      };
      const params = buildExploreQueryParams( state, {
        lat: 37.5,
        lng: -122.1,
        radius: 1,
      } );
      expect( params.lat ).toBe( 37.5 );
      expect( params.lng ).toBe( -122.1 );
      expect( params.radius ).toBe( 1 );
      expect( params.place_id ).toBeUndefined( );
    } );

    it( "omits coords in NEARBY mode when coords are unresolved (worldwide fallback)", ( ) => {
      const state = {
        ...initialExploreState,
        location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
      };
      const params = buildExploreQueryParams( state );
      expect( params.lat ).toBeUndefined( );
      expect( params.lng ).toBeUndefined( );
      expect( params.radius ).toBeUndefined( );
      expect( params.place_id ).toBeUndefined( );
    } );

    it( "omits coords and place in WORLDWIDE mode", ( ) => {
      const state = {
        ...initialExploreState,
        location: { placeMode: EXPLORE_PLACE_MODE.WORLDWIDE },
      };
      const params = buildExploreQueryParams( state );
      expect( params.lat ).toBeUndefined( );
      expect( params.place_id ).toBeUndefined( );
    } );

    it( "uses place_id in PLACE mode", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.PLACE,
          place: { id: 5 },
        },
      };
      const params = buildExploreQueryParams( state );
      expect( params.place_id ).toBe( 5 );
      expect( params.lat ).toBeUndefined( );
    } );

    it( "uses the bounding box in MAP_AREA mode", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.MAP_AREA,
          bounds: {
            swlat: 10, swlng: 20, nelat: 30, nelng: 40,
          },
        },
      };
      const params = buildExploreQueryParams( state );
      expect( params.swlat ).toBe( 10 );
      expect( params.swlng ).toBe( 20 );
      expect( params.nelat ).toBe( 30 );
      expect( params.nelng ).toBe( 40 );
    } );

    it( "omits coords and place in MAP_AREA mode, even with nearby coords resolved", ( ) => {
      const state = {
        ...initialExploreState,
        location: {
          placeMode: EXPLORE_PLACE_MODE.MAP_AREA,
          bounds: {
            swlat: 10, swlng: 20, nelat: 30, nelng: 40,
          },
        },
      };
      const params = buildExploreQueryParams( state, {
        lat: 37.5,
        lng: -122.1,
        radius: 1,
      } );
      expect( params.lat ).toBeUndefined( );
      expect( params.lng ).toBeUndefined( );
      expect( params.radius ).toBeUndefined( );
      expect( params.place_id ).toBeUndefined( );
    } );
  } );

  describe( "sort", ( ) => {
    it( "DATE_UPLOADED_NEWEST → created_at desc", ( ) => {
      const params = buildExploreQueryParams( {
        ...initialExploreState,
        sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
      } );
      expect( params.order_by ).toBe( "created_at" );
      expect( params.order ).toBe( "desc" );
    } );

    it( "DATE_UPLOADED_OLDEST → created_at asc", ( ) => {
      const params = buildExploreQueryParams( {
        ...initialExploreState,
        sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_OLDEST,
      } );
      expect( params.order_by ).toBe( "created_at" );
      expect( params.order ).toBe( "asc" );
    } );

    it( "DATE_OBSERVED_NEWEST → observed_on desc", ( ) => {
      const params = buildExploreQueryParams( {
        ...initialExploreState,
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_NEWEST,
      } );
      expect( params.order_by ).toBe( "observed_on" );
      expect( params.order ).toBe( "desc" );
    } );

    it( "DATE_OBSERVED_OLDEST → observed_on asc", ( ) => {
      const params = buildExploreQueryParams( {
        ...initialExploreState,
        sortBy: OBSERVATIONS_SORT.DATE_OBSERVED_OLDEST,
      } );
      expect( params.order_by ).toBe( "observed_on" );
      expect( params.order ).toBe( "asc" );
    } );

    it( "MOST_FAVED → votes desc", ( ) => {
      const params = buildExploreQueryParams( {
        ...initialExploreState,
        sortBy: OBSERVATIONS_SORT.MOST_FAVED,
      } );
      expect( params.order_by ).toBe( "votes" );
      expect( params.order ).toBe( "desc" );
    } );
  } );

  it( "always sets per_page to 20 and verifiable to true", ( ) => {
    const params = buildExploreQueryParams( initialExploreState );
    expect( params.per_page ).toBe( 20 );
    expect( params.verifiable ).toBe( true );
  } );

  it( "applies sort order to the default state", ( ) => {
    const params = buildExploreQueryParams( initialExploreState );
    expect( params.order_by ).toBe( "created_at" );
    expect( params.order ).toBe( "desc" );
  } );

  it( "combines subject, location, and sort into a single query", ( ) => {
    const state = {
      subject: { type: "taxon", taxon: { id: 42 } },
      location: { placeMode: EXPLORE_PLACE_MODE.NEARBY },
      sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
      filters: {},
    };
    const params = buildExploreQueryParams( state, {
      lat: 37.5,
      lng: -122.1,
      radius: 1,
    } );
    expect( params ).toEqual( {
      per_page: 20,
      verifiable: true,
      order_by: "created_at",
      order: "desc",
      taxon_id: 42,
      lat: 37.5,
      lng: -122.1,
      radius: 1,
    } );
  } );
} );
