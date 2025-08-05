import { screen } from "@testing-library/react-native";
import AddObsButton from "components/AddObsModal/AddObsButton";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import { zustandStorage } from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";

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
    // const addObsButton = <AddObsButton />;

    // Disabled during the update to RN 0.78
    // expect( addObsButton ).toBeAccessible();
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
  it( "to logged out users with 2 observations", async () => {
    zustandStorage.setItem( "numOfUserObservations", 2 );

    renderComponent( <AddObsButton /> );

    const tooltipText = await screen.findByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeTruthy();
  } );

  it( "to logged in users with less than 50 observations", async () => {
    zustandStorage.setItem( "numOfUserObservations", 2 );
    jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );

    renderComponent( <AddObsButton /> );

    // Temporarily disabled the tooltip for new users, as it is freezing the app in some cases.
    // const tooltipText = await screen.findByText(
    //   "Press and hold to view more options"
    // );
    // expect( tooltipText ).toBeTruthy();
  } );

  it( "to new users only after they dismissed the account creation card", async () => {
    zustandStorage.setItem( "numOfUserObservations", 1 );
    setStoreStateLayout( {
      justFinishedSignup: true
    } );

    renderComponent( <AddObsButton /> );

    const tooltipText = screen.queryByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeFalsy();

    setStoreStateLayout( {
      shownOnce: {
        "account-creation": true
      }
    } );

    // Temporarily disabled the tooltip for new users, as it is freezing the app in some cases.
    // const tooltipTextAfter = await screen.findByText(
    //   "Press and hold to view more options"
    // );
    // expect( tooltipTextAfter ).toBeTruthy();
  } );

  it( "to logged in users with more than 50 observations after card dismissal", async () => {
    zustandStorage.setItem( "numOfUserObservations", 51 );

    renderComponent( <AddObsButton /> );

    const tooltipText = screen.queryByText(
      "Press and hold to view more options"
    );
    expect( tooltipText ).toBeFalsy();

    setStoreStateLayout( {
      shownOnce: {
        "fifty-observation": true
      }
    } );

    // Temporarily disabled the tooltip for new users, as it is freezing the app in some cases.
    // const tooltipTextAfter = await screen.findByText(
    //   "Press and hold to view more options"
    // );
    // expect( tooltipTextAfter ).toBeTruthy();
  } );
} );
