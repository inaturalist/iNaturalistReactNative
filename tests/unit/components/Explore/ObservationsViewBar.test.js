import { fireEvent, render, screen } from "@testing-library/react-native";
import ObservationsViewBar from "components/Explore/ObservationsViewBar";
import React from "react";

describe( "ObservationsViewBar", () => {
  it( "renders exactly the buttons listed in viewOptions", () => {
    render(
      <ObservationsViewBar
        layout="grid"
        updateObservationsView={jest.fn( )}
        viewOptions={["grid", "list", "map"]}
      />,
    );

    expect( screen.getByTestId( "SegmentedButton.grid" ) ).toBeTruthy( );
    expect( screen.getByTestId( "SegmentedButton.list" ) ).toBeTruthy( );
    expect( screen.getByTestId( "SegmentedButton.map" ) ).toBeTruthy( );
  } );

  it( "omits a view option that isn't included in viewOptions", () => {
    render(
      <ObservationsViewBar
        layout="grid"
        updateObservationsView={jest.fn( )}
        viewOptions={["grid", "list"]}
      />,
    );

    expect( screen.queryByTestId( "SegmentedButton.map" ) ).toBeNull( );
  } );

  it( "calls updateObservationsView with the pressed button's value", () => {
    const updateObservationsView = jest.fn( );
    render(
      <ObservationsViewBar
        layout="grid"
        updateObservationsView={updateObservationsView}
        viewOptions={["grid", "list", "map"]}
      />,
    );

    fireEvent.press( screen.getByTestId( "SegmentedButton.map" ) );

    expect( updateObservationsView ).toHaveBeenCalledWith( "map" );
  } );
} );
