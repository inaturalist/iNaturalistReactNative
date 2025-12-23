import { render, screen } from "@testing-library/react-native";
import AddObsBottomSheet from "components/AddObsBottomSheet/AddObsBottomSheet";
import React from "react";

// Make sure the mock is using a recent-ish version
jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  __esModule: true,
  default: {
    OS: "ios",
    select: jest.fn( ),
    Version: 11,
  },
} ) );

describe( "AddObsBottomSheet", ( ) => {
  it( "shows the AI camera button", async ( ) => {
    render( <AddObsBottomSheet closeModal={jest.fn( )} /> );
    const aiCameraButton = screen.getByTestId(
      "aicamera-button",
    );
    expect( aiCameraButton ).toBeOnTheScreen();
  } );
} );
