import { render, screen } from "@testing-library/react-native";
import AddObsModal from "components/AddObsModal";
import i18next from "i18next";
import React from "react";
// eslint-disable-next-line import/no-unresolved
import mockPlatform from "react-native/Libraries/Utilities/Platform";

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

describe( "AddObsModal", ( ) => {
  afterEach( () => {
    jest.clearAllMocks( );
  } );

  it( "hides AI camera button on older devices", async ( ) => {
    render( <AddObsModal closeModal={jest.fn( )} /> );
    const arCameraButton = screen.getByLabelText(
      i18next.t( "AI-Camera" )
    );
    expect( arCameraButton ).toBeOnTheScreen();
  } );

  it( "hides AI camera button on older devices", async ( ) => {
    mockPlatform.Version = 9;
    render( <AddObsModal closeModal={jest.fn( )} /> );
    const arCameraButton = screen.queryByLabelText(
      i18next.t( "AI-Camera" )
    );
    expect( arCameraButton ).toBeFalsy( );
  } );
} );
