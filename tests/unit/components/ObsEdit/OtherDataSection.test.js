import { fireEvent, screen } from "@testing-library/react-native";
import OtherDataSection from "components/ObsEdit/OtherDataSection";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "OtherDataSection", () => {
  it( "has no accessibility errors", () => {
    // const otherData = (
    //   <OtherDataSection />
    // );

    // Disabled during the update to RN 0.78
    // expect( otherData ).toBeAccessible();
  } );

  it( "opens notes sheet when notes dropdown is tapped", ( ) => {
    renderComponent( <OtherDataSection /> );

    const notesDropdown = screen.getByLabelText( /Add optional notes/ );
    expect( notesDropdown ).toBeVisible( );
    fireEvent.press( notesDropdown );

    const notesHeader = screen.getByText( /NOTES/ );
    expect( notesHeader ).toBeVisible( );
  } );

  it( "opens captive sheet when captive dropdown is tapped", ( ) => {
    renderComponent( <OtherDataSection /> );

    const captiveDropdown = screen.getByLabelText( /Select captive or cultivated status/ );
    fireEvent.press( captiveDropdown );

    const captiveHeader = screen.getByText( /WILD STATUS/ );
    expect( captiveHeader ).toBeVisible( );
  } );

  it( "opens geoprivacy sheet when geoprivacy dropdown is tapped", ( ) => {
    renderComponent( <OtherDataSection /> );

    const geoprivacyDropdown = screen.getByLabelText( /Select geoprivacy status/ );
    fireEvent.press( geoprivacyDropdown );

    const geoprivacyHeader = screen.getByText( /GEOPRIVACY/ );
    expect( geoprivacyHeader ).toBeVisible( );
  } );
} );
