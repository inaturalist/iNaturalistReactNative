import {
  EXPLORE_ACTION,
  exploreReducer
} from "providers/ExploreContext.tsx";
import factory from "tests/factory";

describe( "ExploreContext", ( ) => {
  describe( "exploreReducer", ( ) => {
    describe( EXPLORE_ACTION.SET_PLACE, ( ) => {
      it( "should remove lat and lng when place set", ( ) => {
        const initialState = { lat: 1, lng: 1 };
        const reducedState = exploreReducer( initialState, {
          type: EXPLORE_ACTION.SET_PLACE,
          place: factory( "RemotePlace" )
        } );
        expect( initialState.lat ).not.toBeUndefined( );
        expect( initialState.lng ).not.toBeUndefined( );
        expect( reducedState.lat ).toBeUndefined( );
        expect( reducedState.lng ).toBeUndefined( );
      } );
    } );
    describe( EXPLORE_ACTION.SET_MAP_BOUNDARIES, ( ) => {
      it( "should remove lat, lng, and radius", ( ) => {
        const initialState = { lat: 1, lng: 1, radius: 50 };
        const reducedState = exploreReducer( initialState, {
          type: EXPLORE_ACTION.SET_MAP_BOUNDARIES,
          mapBoundaries: {
            swlat: 0,
            swlng: 0,
            nelat: 1,
            nelng: 1,
            place_guess: "somwhere"
          }
        } );
        expect( initialState.lat ).not.toBeUndefined( );
        expect( initialState.lng ).not.toBeUndefined( );
        expect( initialState.radius ).not.toBeUndefined( );
        expect( reducedState.lat ).toBeUndefined( );
        expect( reducedState.lng ).toBeUndefined( );
        expect( reducedState.radius ).toBeUndefined( );
      } );
    } );
  } );
} );
