import { act, screen, userEvent } from "@testing-library/react-native";
import ExploreV2MapView from "components/Explore/ExploreV2/components/ExploreV2MapView";
import i18next from "i18next";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React from "react";
import { animateToRegion } from "react-native-maps";
import { renderComponent } from "tests/helpers/render";

// Map asks for location permission on mount. Without this the real hook
// resolves after the test body has finished and React complains about state
// updates outside of act( ).
jest.mock( "sharedHooks/useLocationPermission", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    hasPermissions: true,
    hasBlockedPermissions: false,
    renderPermissionsGate: ( ) => null,
    requestPermissions: jest.fn( ),
  } ),
} ) );

const mockQueryParams = {
  per_page: 20,
  order_by: "created_at",
  order: "desc",
  verifiable: true,
  taxon_id: 42,
};

const mockTotalBounds = {
  swlat: 10,
  swlng: 20,
  nelat: 30,
  nelng: 40,
};

const renderMapView = ( props, update = null ) => renderComponent(
  <ExploreV2MapView
    appliedSearchCount={0}
    isLoading={false}
    placeMode={EXPLORE_V2_PLACE_MODE.WORLDWIDE}
    queryParams={mockQueryParams}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />,
  update,
);

const mapProps = ( ) => screen.getByTestId( "Map.MapView" ).props;

describe( "ExploreV2MapView", ( ) => {
  beforeEach( ( ) => {
    animateToRegion.mockClear( );
  } );

  it( "shows a loading indicator while results are loading", ( ) => {
    renderMapView( { isLoading: true } );

    expect( screen.getByTestId( "ExploreV2MapView.loading" ) ).toBeTruthy( );
  } );

  it( "hides the loading indicator once results have loaded", ( ) => {
    renderMapView( { isLoading: false } );

    expect( screen.queryByTestId( "ExploreV2MapView.loading" ) ).toBeNull( );
  } );

  it( "shows the whole world when a worldwide search has no bounds yet", ( ) => {
    renderMapView( { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE } );

    expect( mapProps( ).initialRegion ).toEqual( {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 180,
      longitudeDelta: 180,
    } );
  } );

  it( "frames a worldwide search on the results, so a regional taxon isn't off screen", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
      totalBounds: mockTotalBounds,
    } );

    const { initialRegion } = mapProps( );
    expect( initialRegion.latitude ).toBe( 20 );
    expect( initialRegion.longitude ).toBe( 30 );
  } );

  it( "zooms to the user's coordinates when the search is nearby", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
      nearbyCoords: { lat: 37.5, lng: -122.1, radius: 1 },
    } );

    const { initialRegion } = mapProps( );
    expect( initialRegion.latitude ).toBe( 37.5 );
    expect( initialRegion.longitude ).toBe( -122.1 );
    expect( initialRegion.latitudeDelta ).toBe( 0.02 );
  } );

  it( "ignores the result bounds when the search is nearby", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
      nearbyCoords: { lat: 37.5, lng: -122.1, radius: 1 },
      totalBounds: mockTotalBounds,
    } );

    expect( mapProps( ).initialRegion.latitude ).toBe( 37.5 );
  } );

  it( "frames the results when the search is for a place", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
      totalBounds: mockTotalBounds,
    } );

    const { initialRegion } = mapProps( );
    expect( initialRegion.latitude ).toBe( 20 );
    expect( initialRegion.longitude ).toBe( 30 );
    expect( initialRegion.latitudeDelta ).toBe( 28 );
    expect( initialRegion.longitudeDelta ).toBe( 28 );
  } );

  it( "keeps the map up at world scale until a place's bounds load", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
      totalBounds: undefined,
    } );

    expect( mapProps( ).initialRegion.latitudeDelta ).toBe( 180 );
    expect( screen.queryByTestId( "ExploreV2MapView.loading" ) ).toBeNull( );
  } );

  it( "shows the whole world when a worldwide search's bounds cover the globe", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
      totalBounds: {
        swlat: -85, swlng: -180, nelat: 85, nelng: 180,
      },
    } );

    expect( mapProps( ).initialRegion.latitudeDelta ).toBe( 180 );
    expect( mapProps( ).initialRegion.longitudeDelta ).toBe( 180 );
  } );

  it( "shows the whole world when a worldwide search's bounds collapse to a sliver", ( ) => {
    // What the API hands back for a global result set: full latitude, no longitude
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
      totalBounds: {
        swlat: -41.7, swlng: -2.5e-7, nelat: 47.3, nelng: -8.3e-8,
      },
    } );

    expect( mapProps( ).initialRegion ).toEqual( {
      latitude: 0,
      longitude: 0,
      latitudeDelta: 180,
      longitudeDelta: 180,
    } );
  } );

  it( "still frames a place whose bounds happen to span the globe", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
      totalBounds: {
        swlat: -85, swlng: -180, nelat: 85, nelng: 180,
      },
    } );

    // getMapRegion caps the deltas, so this is the framed result, not the worldwide default
    expect( mapProps( ).initialRegion.latitudeDelta ).toBe( 89 );
    expect( mapProps( ).initialRegion.longitudeDelta ).toBe( 179 );
  } );

  describe( "applied searches", ( ) => {
    const savedArea = {
      swlat: 43, swlng: -97, nelat: 49, nelng: -89,
    };
    const savedAreaRegion = {
      latitude: 46,
      longitude: -93,
      latitudeDelta: 6,
      longitudeDelta: 8,
    };

    it( "moves the map to an area chosen somewhere else, like a saved search", ( ) => {
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE,
        totalBounds: mockTotalBounds,
      } );
      animateToRegion.mockClear( );

      renderMapView( {
        appliedSearchCount: 1,
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: savedArea,
        totalBounds: mockTotalBounds,
        queryParams: { ...mockQueryParams, swlat: 43 },
      }, rerender );

      expect( animateToRegion ).toHaveBeenCalledWith( savedAreaRegion );
    } );

    it( "does not move the map back to an area the user just panned to", async ( ) => {
      const actor = userEvent.setup( );
      const onRedoSearchPress = jest.fn( );
      const { rerender } = renderMapView( { onRedoSearchPress } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      await actor.press( screen.getByText( i18next.t( "REDO-SEARCH-IN-MAP-AREA" ) ) );
      animateToRegion.mockClear( );

      // the bounds the map reported come back around as the search's map area
      renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: onRedoSearchPress.mock.calls[0][0],
        queryParams: { ...mockQueryParams, swlat: 1 },
      }, rerender );

      expect( animateToRegion ).not.toHaveBeenCalled( );
    } );

    it( "moves the map back to a saved area even when it matches the last redo", async ( ) => {
      // Saved map area searches are made from the map's own redo, so their bounds equal
      // the bounds it reported. Panning away and applying one must still bring the map back.
      const actor = userEvent.setup( );
      const onRedoSearchPress = jest.fn( );
      const { rerender } = renderMapView( { onRedoSearchPress } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      await actor.press( screen.getByText( i18next.t( "REDO-SEARCH-IN-MAP-AREA" ) ) );
      const reportedBounds = onRedoSearchPress.mock.calls[0][0];
      renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: reportedBounds,
      }, rerender );
      act( ( ) => mapProps( ).onPanDrag( ) );
      animateToRegion.mockClear( );

      renderMapView( {
        appliedSearchCount: 1,
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: reportedBounds,
      }, rerender );

      expect( animateToRegion ).toHaveBeenCalledWith( {
        latitude: 2,
        longitude: 3,
        latitudeDelta: 2,
        longitudeDelta: 2,
      } );
      expect( screen.queryByText( i18next.t( "REDO-SEARCH-IN-MAP-AREA" ) ) ).toBeNull( );
    } );

    it( "leaves a redo alone after an applied search", async ( ) => {
      const actor = userEvent.setup( );
      const onRedoSearchPress = jest.fn( );
      const { rerender } = renderMapView( {
        appliedSearchCount: 1,
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: savedArea,
        onRedoSearchPress,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      await actor.press( screen.getByText( i18next.t( "REDO-SEARCH-IN-MAP-AREA" ) ) );
      animateToRegion.mockClear( );

      renderMapView( {
        appliedSearchCount: 1,
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: onRedoSearchPress.mock.calls[0][0],
        onRedoSearchPress,
      }, rerender );

      expect( animateToRegion ).not.toHaveBeenCalled( );
    } );

    it( "re-frames a place search that is applied again after panning away", ( ) => {
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: mockTotalBounds,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      animateToRegion.mockClear( );

      renderMapView( {
        appliedSearchCount: 1,
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: mockTotalBounds,
      }, rerender );

      expect( animateToRegion ).toHaveBeenCalledWith( mapProps( ).initialRegion );
      expect( screen.queryByText( i18next.t( "REDO-SEARCH-IN-MAP-AREA" ) ) ).toBeNull( );
    } );

    it( "re-frames a nearby search that is applied again after panning away", ( ) => {
      const nearbyCoords = { lat: 37.5, lng: -122.1, radius: 1 };
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        nearbyCoords,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      animateToRegion.mockClear( );

      renderMapView( {
        appliedSearchCount: 1,
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        nearbyCoords,
      }, rerender );

      expect( animateToRegion ).toHaveBeenCalledWith( {
        latitude: 37.5,
        longitude: -122.1,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      } );
    } );
  } );

  it( "keeps ignoring new result bounds while a map area stays up", ( ) => {
    const { rerender } = renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
      mapAreaBounds: mockTotalBounds,
    } );
    animateToRegion.mockClear( );

    // Results come back for the map area search
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
      mapAreaBounds: mockTotalBounds,
      totalBounds: {
        swlat: -80, swlng: -170, nelat: 80, nelng: 170,
      },
    }, rerender );

    expect( animateToRegion ).not.toHaveBeenCalled( );
  } );

  it( "restores the chosen area when the map remounts in map area mode", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
      mapAreaBounds: {
        swlat: 10, swlng: 20, nelat: 30, nelng: 40,
      },
    } );

    expect( mapProps( ).initialRegion ).toEqual( {
      latitude: 20,
      longitude: 30,
      latitudeDelta: 20,
      longitudeDelta: 20,
    } );
  } );

  it( "prefers the chosen area over loaded result bounds when the map remounts", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
      mapAreaBounds: {
        swlat: 10, swlng: 20, nelat: 30, nelng: 40,
      },
      totalBounds: {
        swlat: 12, swlng: 22, nelat: 14, nelng: 24,
      },
    } );

    expect( mapProps( ).initialRegion ).toEqual( {
      latitude: 20,
      longitude: 30,
      latitudeDelta: 20,
      longitudeDelta: 20,
    } );
  } );

  describe( "redo search in map area", ( ) => {
    const redoSearchButton = ( ) => screen.queryByText(
      i18next.t( "REDO-SEARCH-IN-MAP-AREA" ),
    );

    it( "hides the button until the user moves the map", ( ) => {
      renderMapView( );

      expect( redoSearchButton( ) ).toBeNull( );
    } );

    it( "shows the button once the user pans the map", ( ) => {
      renderMapView( );

      act( ( ) => mapProps( ).onPanDrag( ) );

      expect( redoSearchButton( ) ).toBeVisible( );
    } );

    it( "reports the visible bounds when the button is pressed", async ( ) => {
      const actor = userEvent.setup( );
      const onRedoSearchPress = jest.fn( );
      renderMapView( { onRedoSearchPress } );
      act( ( ) => mapProps( ).onPanDrag( ) );

      await actor.press( redoSearchButton( ) );

      expect( onRedoSearchPress ).toHaveBeenCalledWith( {
        swlat: 1,
        swlng: 2,
        nelat: 3,
        nelng: 4,
      } );
    } );

    it( "hides the button after it's pressed", async ( ) => {
      const actor = userEvent.setup( );
      renderMapView( { onRedoSearchPress: jest.fn( ) } );
      act( ( ) => mapProps( ).onPanDrag( ) );

      await actor.press( redoSearchButton( ) );

      expect( redoSearchButton( ) ).toBeNull( );
    } );

    it( "hides the button when a new search frames the map somewhere else", ( ) => {
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: mockTotalBounds,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      expect( redoSearchButton( ) ).toBeVisible( );

      renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: {
          swlat: 43, swlng: -97, nelat: 49, nelng: -89,
        },
      }, rerender );

      expect( redoSearchButton( ) ).toBeNull( );
    } );

    it( "hides the button while a new search's bounds are still loading", ( ) => {
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: mockTotalBounds,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );

      renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: undefined,
      }, rerender );

      expect( redoSearchButton( ) ).toBeNull( );
    } );

    it( "hides the button while the map waits for the user's location", ( ) => {
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.MAP_AREA,
        mapAreaBounds: mockTotalBounds,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );
      expect( redoSearchButton( ) ).toBeVisible( );

      renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        nearbyCoords: undefined,
      }, rerender );

      expect( redoSearchButton( ) ).toBeNull( );
    } );

    it( "hides the button when the search switches to nearby", ( ) => {
      const { rerender } = renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
        totalBounds: mockTotalBounds,
      } );
      act( ( ) => mapProps( ).onPanDrag( ) );

      renderMapView( {
        placeMode: EXPLORE_V2_PLACE_MODE.NEARBY,
        nearbyCoords: { lat: 37.5, lng: -122.1, radius: 1 },
      }, rerender );

      expect( redoSearchButton( ) ).toBeNull( );
    } );
  } );
} );
