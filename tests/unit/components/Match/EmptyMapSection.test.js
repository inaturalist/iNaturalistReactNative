import { fireEvent, screen } from "@testing-library/react-native";
import EmptyMapSection from "components/Match/EmptyMapSection";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "EmptyMapSection", () => {
  const mockHandleAddLocationPressed = jest.fn();
  it( "displays the location indicator icon", () => {
    renderComponent(
      <EmptyMapSection
        isFetchingLocation={false}
        handleAddLocationPressed={mockHandleAddLocationPressed}
      />
    );

    const locationIndicator = screen.getByTestId( "Map.LocationIndicator" );
    expect( locationIndicator ).toBeVisible();
  } );

  it( "calls handleAddLocationPressed when button is pressed", () => {
    renderComponent(
      <EmptyMapSection
        isFetchingLocation={false}
        handleAddLocationPressed={mockHandleAddLocationPressed}
      />
    );

    const button = screen.getByText( "ADD LOCATION FOR BETTER IDS" );
    fireEvent.press( button );

    expect( mockHandleAddLocationPressed ).toHaveBeenCalled();
  } );

  it( "shows loading state when isFetchingLocation is true", () => {
    renderComponent(
      <EmptyMapSection
        isFetchingLocation
        handleAddLocationPressed={mockHandleAddLocationPressed}
      />
    );

    const button = screen.getByLabelText( "Edit location" );
    expect( button.props.accessibilityState.disabled ).toBe( true );
  } );
} );
