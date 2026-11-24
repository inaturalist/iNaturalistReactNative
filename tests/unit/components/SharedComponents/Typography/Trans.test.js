import { act, render, screen } from "@testing-library/react-native";
import Trans from "components/SharedComponents/Typography/Trans";
import i18next from "i18next";
import React from "react";
import { Text } from "react-native";

// Props never change, so the React Compiler caches the Trans element, like
// most real uses
const SignUpPrompt = ( ) => (
  <Trans
    i18nKey="Dont-have-an-account"
    components={[<Text key="0" />, <Text key="1" />]}
  />
);

describe( "Trans", ( ) => {
  afterEach( async ( ) => {
    await act( ( ) => i18next.changeLanguage( "en" ) );
  } );

  it( "updates when the language changes", async ( ) => {
    render( <SignUpPrompt /> );
    expect( screen.getByText( "Sign up" ) ).toBeVisible( );

    await act( ( ) => i18next.changeLanguage( "es" ) );

    expect( screen.getByText( "Regístrate" ) ).toBeVisible( );
  } );
} );
