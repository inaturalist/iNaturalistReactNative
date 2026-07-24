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
    renderComponent( <MyObservationsMapView userId={123} /> );

    expect( screen.getByTestId( "MyObservationsMapView.loading" ) ).toBeTruthy( );
  } );

  it( "hides the loading indicator once bounds have loaded", ( ) => {
    useMyObservationsMapBounds.mockReturnValue( {
      totalBounds: {
        swlat: 1, swlng: 2, nelat: 3, nelng: 4,
      },
      isLoading: false,
    } );
    renderComponent( <MyObservationsMapView userId={123} /> );

    expect( screen.queryByTestId( "MyObservationsMapView.loading" ) ).toBeNull( );
  } );

  it( "passes the searched taxon into the map bounds hook", ( ) => {
    useMyObservations.mockReturnValue( {
      state: { searchedTaxon: { id: 999, name: "Canis latrans" } },
    } );
    renderComponent( <MyObservationsMapView userId={123} /> );

    expect( useMyObservationsMapBounds ).toHaveBeenCalledWith( 123, 999, true );
  } );
} );
