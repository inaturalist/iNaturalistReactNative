import { fireEvent, screen } from "@testing-library/react-native";
import { Checkbox } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";
import colors from "styles/tailwindColors";

import { renderComponent } from "../../../helpers/render";

describe( "Checkbox", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "has no accessibility errors", () => {
    const checkbox = <Checkbox text="Checkmark text" />;

    expect( checkbox ).toBeAccessible();
  } );

  it( "renders an empty checkbox before press", () => {
    renderComponent( <Checkbox text="Checkmark text" /> );

    const checkmark = screen.getByLabelText( /Checkmark/ );

    expect( checkmark ).toBeTruthy( );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.darkGray
    } );
  } );

  it( "renders a green filled checkbox after press", () => {
    renderComponent( <Checkbox text="Checkmark text" /> );

    const checkmark = screen.getByLabelText( /Checkmark/ );
    fireEvent.press( checkmark );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.inatGreen
    } );
  } );

  it( "renders text and allows checkmark toggle by pressing text", () => {
    renderComponent( <Checkbox text="Checkmark text" /> );

    const text = screen.getByText( /Checkmark text/ );
    expect( text ).toBeVisible( );
    fireEvent.press( text );
    const checkmark = screen.getByLabelText( /Checkmark/ );
    expect( checkmark ).toHaveProp( "innerIconStyle", {
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.inatGreen
    } );
  } );
} );
