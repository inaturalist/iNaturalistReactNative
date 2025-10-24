import { screen } from "@testing-library/react-native";
import AddObsButton from "components/AddObsBottomSheet/AddObsButton";
import React from "react";
import { renderComponent } from "tests/helpers/render";

// Mock getCurrentRoute to return ObsList
jest.mock( "navigation/navigationUtils", () => ( {
  getCurrentRoute: () => ( {
    name: "ObsList"
  } )
} ) );

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
