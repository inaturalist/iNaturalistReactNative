import { act, screen } from "@testing-library/react-native";
import useMyObservationsMapBounds from "components/MyObservations/hooks/useMyObservationsMapBounds";
import MyObservationsMapView from "components/MyObservations/MyObservationsMapView";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/MyObservations/hooks/useMyObservationsMapBounds", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

// Announcements fetches from the API and renders its body in a WebView. All we care about
// here is whether the map view renders it, so stand in a marker we can query for.
jest.mock( "components/MyObservations/Announcements", ( ) => {
  const MockReact = require( "react" );
  const { View } = require( "react-native" );
  return {
    __esModule: true,
    default: ( ) => MockReact.createElement( View, { testID: "announcements" } ),
  };
} );

// Captures what the map is told to display, so we can tell "put the user back
// where they were" apart from "fit to the user's observations". Mocking the Map
// module itself rather than the SharedComponents barrel it's re-exported from.
let mockMapProps = {};
jest.mock( "components/SharedComponents/Map/Map", ( ) => ( {
  __esModule: true,
  default: jest.fn( props => {
    mockMapProps = props;
    return null;
  } ),
} ) );

const BOUNDS = {
  swlat: 1, swlng: 2, nelat: 3, nelng: 4,
};
const PANNED_REGION = {
  latitude: 10,
  longitude: 20,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};
const AVES = { id: 111, name: "Aves" };
const COYOTE = { id: 999, name: "Canis latrans" };

const initialStoreState = useStore.getState( );

// Searching is what clears a stored map region, so go through the store rather
// than setting searchedTaxon directly
const searchTaxon = taxon => useStore.getState( ).updateMyObservations( previous => ( {
  ...previous,
  searchedTaxon: taxon,
} ) );

describe( "MyObservationsMapView", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
    mockMapProps = {};
    useStore.setState( initialStoreState, true );
    useMyObservationsMapBounds.mockReturnValue( { totalBounds: undefined, isLoading: false } );
  } );

  it( "shows a loading indicator while bounds are loading", ( ) => {
    useMyObservationsMapBounds.mockReturnValue( { totalBounds: undefined, isLoading: true } );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.getByTestId( "MyObservationsMapView.loading" ) ).toBeTruthy( );
  } );

  it( "hides the loading indicator once bounds have loaded", ( ) => {
    useMyObservationsMapBounds.mockReturnValue( { totalBounds: BOUNDS, isLoading: false } );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.queryByTestId( "MyObservationsMapView.loading" ) ).toBeNull( );
  } );

  it( "shows announcements above the map", ( ) => {
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.getByTestId( "announcements" ) ).toBeVisible( );
  } );

  it( "hides announcements while a search is active", ( ) => {
    searchTaxon( COYOTE );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.queryByTestId( "announcements" ) ).toBeNull( );
  } );

  it( "passes the searched taxon into the map bounds hook", ( ) => {
    searchTaxon( COYOTE );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( useMyObservationsMapBounds ).toHaveBeenCalledWith( 123, COYOTE.id, true );
  } );

  describe( "remembers where the user left the camera", ( ) => {
    beforeEach( ( ) => {
      useMyObservationsMapBounds.mockReturnValue( { totalBounds: BOUNDS, isLoading: false } );
    } );

    it( "fits to the user's observations when they have not moved the camera", ( ) => {
      renderComponent( <MyObservationsMapView isConnected userId={123} /> );

      expect( mockMapProps.regionToAnimate ).toBeTruthy( );
    } );

    it( "returns to the stored region instead of re-fitting to bounds", ( ) => {
      useStore.getState( ).setMyObservationsMapRegion( PANNED_REGION );
      renderComponent( <MyObservationsMapView isConnected userId={123} /> );

      expect( mockMapProps.initialRegion ).toEqual( PANNED_REGION );
      expect( mockMapProps.regionToAnimate ).toBeUndefined( );
    } );

    it( "refits to bounds when the user searches a different taxon and back again", ( ) => {
      searchTaxon( AVES );
      useStore.getState( ).setMyObservationsMapRegion( PANNED_REGION );
      renderComponent( <MyObservationsMapView isConnected userId={123} /> );
      expect( mockMapProps.regionToAnimate ).toBeUndefined( );

      act( ( ) => searchTaxon( COYOTE ) );
      act( ( ) => searchTaxon( AVES ) );

      expect( mockMapProps.regionToAnimate ).toBeTruthy( );
    } );

    it( "records the camera position once bounds have loaded", ( ) => {
      renderComponent( <MyObservationsMapView isConnected userId={123} /> );

      mockMapProps.onRegionChangeComplete( PANNED_REGION );

      expect( useStore.getState( ).myObservationsMapRegion ).toEqual( PANNED_REGION );
    } );

    it( "ignores camera positions while bounds are still loading, so the "
      + "worldwide placeholder is never stored", ( ) => {
      useMyObservationsMapBounds.mockReturnValue( { totalBounds: undefined, isLoading: true } );
      renderComponent( <MyObservationsMapView isConnected userId={123} /> );

      mockMapProps.onRegionChangeComplete( PANNED_REGION );

      expect( useStore.getState( ).myObservationsMapRegion ).toBeNull( );
    } );
  } );
} );
