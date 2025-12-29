// Separate tests for iOS 9. AddObsBottomSheet sets some OS-specific constants at
// load time that can't be altered at runtime, so we're using a separate test
// with a separate mock to control those load time values.
import { render, screen } from "@testing-library/react-native";
import AddObsBottomSheet from "components/AddObsBottomSheet/AddObsBottomSheet";
import i18next from "i18next";
import React from "react";

// Make sure the mock reports OS version 9
jest.mock( "react-native/Libraries/Utilities/Platform", () => ( {
  __esModule: true,
  default: {
    OS: "ios",
    select: jest.fn(),
    Version: 9,
  },
} ) );

describe( "AddObsBottomSheet in iOS 9", ( ) => {
  it( "hides AI camera button on older devices", async ( ) => {
    render( <AddObsBottomSheet closeModal={jest.fn( )} /> );
    const arCameraButton = screen.queryByLabelText(
      i18next.t( "AI-Camera" ),
    );
    expect( arCameraButton ).toBeFalsy( );
  } );
} );
