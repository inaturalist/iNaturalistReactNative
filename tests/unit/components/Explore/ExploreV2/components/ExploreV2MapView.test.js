import { screen } from "@testing-library/react-native";
import ExploreV2MapView from "components/Explore/ExploreV2/components/ExploreV2MapView";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React from "react";
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

const renderMapView = props => renderComponent(
  <ExploreV2MapView
    isLoading={false}
    placeMode={EXPLORE_V2_PLACE_MODE.WORLDWIDE}
    queryParams={mockQueryParams}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />,
);

const mapProps = ( ) => screen.getByTestId( "Map.MapView" ).props;

describe( "ExploreV2MapView", ( ) => {
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

  it( "falls back to the whole world when a place's bounds haven't loaded yet", ( ) => {
    renderMapView( {
      placeMode: EXPLORE_V2_PLACE_MODE.PLACE,
      totalBounds: undefined,
    } );

    expect( mapProps( ).initialRegion.latitudeDelta ).toBe( 180 );
  } );
} );
