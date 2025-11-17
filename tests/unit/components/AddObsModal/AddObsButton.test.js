import { screen } from "@testing-library/react-native";
import AddObsButton from "components/AddObsBottomSheet/AddObsButton";
import { navigationRef } from "navigation/navigationUtils";
import React from "react";
import { renderComponent } from "tests/helpers/render";

// Mock methods needed to get the current route
navigationRef.isReady = jest.fn( () => true );
navigationRef.getCurrentRoute = jest.fn( () => ( { name: "ObsList" } ) );
navigationRef.addListener = jest.fn( () => jest.fn() );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => undefined
} ) );

describe( "AddObsButton", () => {
  it( "should not have accessibility errors", () => {
    // const addObsButton = <AddObsButton />;

    // Disabled during the update to RN 0.78
    // expect( addObsButton ).toBeAccessible();
  } );

  it( "renders correctly", () => {
    renderComponent( <AddObsButton /> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
