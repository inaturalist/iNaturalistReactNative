import { render, screen } from "@testing-library/react-native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import i18next from "i18next";
import React from "react";

// Make sure the mock is using a recent-ish version
jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

describe( "AddObsModal", ( ) => {
  it( "shows the AI camera button", async ( ) => {
    render( <AddObsModal closeModal={jest.fn( )} /> );
    const aiCameraButton = screen.getByLabelText(
      i18next.t( "AI-Camera" )
    );
    expect( aiCameraButton ).toBeOnTheScreen();
  } );
} );
