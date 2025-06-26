import { screen } from "@testing-library/react-native";
import AddObsButton from "components/AddObsModal/AddObsButton";
import React from "react";
// import useStore, { zustandStorage } from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

// Mock getCurrentRoute to return ObsList
jest.mock( "navigation/navigationUtils", () => ( {
  getCurrentRoute: () => ( {
    name: "ObsList"
  } )
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
} );

// describe( "shows tooltip", () => {
//   beforeAll( ( ) => {

//   } );
//   it( "for logged out users with 2 observations", async () => {
//     renderComponent( <AddObsButton /> );

//     useStore.setState( {
//       numOfUserObservations: 2
//     } );
//     // setStoreStateLayout( {
//     //   isDefaultMode: false
//     // } );

//     const tooltipText = await screen.findByText( "Press and hold to view more options" );
//     expect( tooltipText ).toBeVisible();
//   } );
// } );
