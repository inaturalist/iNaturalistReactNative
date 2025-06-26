import { screen } from "@testing-library/react-native";
import AddObsButton from "components/AddObsModal/AddObsButton";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import { zustandStorage } from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

// Mock getCurrentRoute to return ObsList
jest.mock( "navigation/navigationUtils", () => ( {
  getCurrentRoute: () => ( {
    name: "ObsList"
  } )
} ) );

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => undefined
} ) );

describe( "AddObsButton", () => {
  it( "should not have accessibility errors", () => {
    const addObsButton = <AddObsButton />;

    expect( addObsButton ).toBeAccessible();
  } );

  it( "renders correctly", () => {
    renderComponent( <AddObsButton /> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "does not render tooltip in default state", () => {
    renderComponent( <AddObsButton /> );

    const tooltipText = screen.queryByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeFalsy();
  } );
} );

describe( "shows tooltip", () => {
  it( "for logged out users with 2 observations", async () => {
    zustandStorage.setItem( "numOfUserObservations", 2 );

    renderComponent( <AddObsButton /> );

    const tooltipText = await screen.findByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeTruthy();
  } );

  it( "for logged in users with less than 50 observations", async () => {
    zustandStorage.setItem( "numOfUserObservations", 2 );
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );

    renderComponent( <AddObsButton /> );

    const tooltipText = await screen.findByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeTruthy();
  } );
} );
