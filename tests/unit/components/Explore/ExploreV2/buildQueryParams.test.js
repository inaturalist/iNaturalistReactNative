import buildExploreV2QueryParams
  from "components/Explore/ExploreV2/buildQueryParams";
import {
  EXPLORE_V2_PLACE_MODE,
  EXPLORE_V2_SORT,
  initialExploreV2State,
} from "providers/ExploreV2Context";

describe( "buildExploreV2QueryParams", ( ) => {
  describe( "subject filter", ( ) => {
    it( "maps a selected taxon to taxon_id", ( ) => {
      const state = {
        ...initialExploreV2State,
        subject: { type: "taxon", taxon: { id: 42 } },
      };
      const params = buildExploreV2QueryParams( state );
      expect( params.taxon_id ).toBe( 42 );
      expect( params.user_id ).toBeUndefined( );
      expect( params.project_id ).toBeUndefined( );
    } );

    it( "maps a selected user to user_id", ( ) => {
      const state = {
        ...initialExploreV2State,
        subject: { type: "user", user: { id: 7 } },
      };
      const params = buildExploreV2QueryParams( state );
      expect( params.user_id ).toBe( 7 );
      expect( params.taxon_id ).toBeUndefined( );
    } );

    it( "maps a selected project to project_id", ( ) => {
      const state = {
        ...initialExploreV2State,
        subject: { type: "project", project: { id: 12 } },
      };
      const params = buildExploreV2QueryParams( state );
      expect( params.project_id ).toBe( 12 );
    } );
  } );

  describe( "location", ( ) => {
    it( "includes lat/lng/radius in NEARBY mode with coords", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
          lat: 37.5,
          lng: -122.1,
          radius: 1,
        },
      };
      const params = buildExploreV2QueryParams( state );
      expect( params.lat ).toBe( 37.5 );
      expect( params.lng ).toBe( -122.1 );
      expect( params.radius ).toBe( 1 );
      expect( params.place_id ).toBeUndefined( );
    } );

    it( "omits coords and place in WORLDWIDE mode", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
      };
      const params = buildExploreV2QueryParams( state );
      expect( params.lat ).toBeUndefined( );
      expect( params.place_id ).toBeUndefined( );
    } );

    it( "uses place_id in PLACE mode", ( ) => {
      const state = {
        ...initialExploreV2State,
        location: {
          placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
          place: { id: 5 },
        },
      };
      const params = buildExploreV2QueryParams( state );
      expect( params.place_id ).toBe( 5 );
      expect( params.lat ).toBeUndefined( );
    } );
  } );

  describe( "sort", ( ) => {
    it( "DATE_UPLOADED_NEWEST → created_at desc", ( ) => {
      const params = buildExploreV2QueryParams( {
        ...initialExploreV2State,
        sortBy: EXPLORE_V2_SORT.DATE_UPLOADED_NEWEST,
      } );
      expect( params.order_by ).toBe( "created_at" );
      expect( params.order ).toBe( "desc" );
    } );

    it( "DATE_UPLOADED_OLDEST → created_at asc", ( ) => {
      const params = buildExploreV2QueryParams( {
        ...initialExploreV2State,
        sortBy: EXPLORE_V2_SORT.DATE_UPLOADED_OLDEST,
      } );
      expect( params.order_by ).toBe( "created_at" );
      expect( params.order ).toBe( "asc" );
    } );

    it( "DATE_OBSERVED_NEWEST → observed_on desc", ( ) => {
      const params = buildExploreV2QueryParams( {
        ...initialExploreV2State,
        sortBy: EXPLORE_V2_SORT.DATE_OBSERVED_NEWEST,
      } );
      expect( params.order_by ).toBe( "observed_on" );
      expect( params.order ).toBe( "desc" );
    } );

    it( "DATE_OBSERVED_OLDEST → observed_on asc", ( ) => {
      const params = buildExploreV2QueryParams( {
        ...initialExploreV2State,
        sortBy: EXPLORE_V2_SORT.DATE_OBSERVED_OLDEST,
      } );
      expect( params.order_by ).toBe( "observed_on" );
      expect( params.order ).toBe( "asc" );
    } );

    it( "MOST_FAVED → votes desc", ( ) => {
      const params = buildExploreV2QueryParams( {
        ...initialExploreV2State,
        sortBy: EXPLORE_V2_SORT.MOST_FAVED,
      } );
      expect( params.order_by ).toBe( "votes" );
      expect( params.order ).toBe( "desc" );
    } );
  } );

  it( "always sets per_page to 20 and verifiable to true", ( ) => {
    const params = buildExploreV2QueryParams( initialExploreV2State );
    expect( params.per_page ).toBe( 20 );
    expect( params.verifiable ).toBe( true );
  } );

  it( "applies sort order to the default state", ( ) => {
    const params = buildExploreV2QueryParams( initialExploreV2State );
    expect( params.order_by ).toBe( "created_at" );
    expect( params.order ).toBe( "desc" );
  } );

  it( "combines subject, location, and sort into a single query", ( ) => {
    const state = {
      subject: { type: "taxon", taxon: { id: 42 } },
      location: {
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        lat: 37.5,
        lng: -122.1,
        radius: 1,
      },
      sortBy: EXPLORE_V2_SORT.MOST_FAVED,
      filters: {},
    };
    const params = buildExploreV2QueryParams( state );
    expect( params ).toEqual( {
      per_page: 20,
      verifiable: true,
      order_by: "votes",
      order: "desc",
      taxon_id: 42,
      lat: 37.5,
      lng: -122.1,
      radius: 1,
    } );
  } );
} );
