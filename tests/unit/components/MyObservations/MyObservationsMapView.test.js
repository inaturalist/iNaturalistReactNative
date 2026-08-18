import { screen } from "@testing-library/react-native";
import useMyObservationsMapBounds from "components/MyObservations/hooks/useMyObservationsMapBounds";
import MyObservationsMapView from "components/MyObservations/MyObservationsMapView";
import { useMyObservations } from "providers/MyObservationsContext";
import React from "react";
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

jest.mock( "providers/MyObservationsContext", ( ) => ( {
  __esModule: true,
  useMyObservations: jest.fn( ),
} ) );

describe( "MyObservationsMapView", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
    useMyObservations.mockReturnValue( { state: { searchedTaxon: null } } );
    useMyObservationsMapBounds.mockReturnValue( { totalBounds: undefined, isLoading: false } );
  } );

  it( "shows a loading indicator while bounds are loading", ( ) => {
    useMyObservationsMapBounds.mockReturnValue( { totalBounds: undefined, isLoading: true } );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.getByTestId( "MyObservationsMapView.loading" ) ).toBeTruthy( );
  } );

  it( "hides the loading indicator once bounds have loaded", ( ) => {
    useMyObservationsMapBounds.mockReturnValue( {
      totalBounds: {
        swlat: 1, swlng: 2, nelat: 3, nelng: 4,
      },
      isLoading: false,
    } );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.queryByTestId( "MyObservationsMapView.loading" ) ).toBeNull( );
  } );

  it( "shows announcements above the map", ( ) => {
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.getByTestId( "announcements" ) ).toBeVisible( );
  } );

  it( "hides announcements while a search is active", ( ) => {
    useMyObservations.mockReturnValue( {
      state: { searchedTaxon: { id: 999, name: "Canis latrans" } },
    } );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( screen.queryByTestId( "announcements" ) ).toBeNull( );
  } );

  it( "passes the searched taxon into the map bounds hook", ( ) => {
    useMyObservations.mockReturnValue( {
      state: { searchedTaxon: { id: 999, name: "Canis latrans" } },
    } );
    renderComponent( <MyObservationsMapView isConnected userId={123} /> );

    expect( useMyObservationsMapBounds ).toHaveBeenCalledWith( 123, 999, true );
  } );
} );
