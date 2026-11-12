import { screen, userEvent } from "@testing-library/react-native";
import { authenticateUser } from "components/LoginSignUp/AuthenticationService";
import LoginForm from "components/LoginSignUp/LoginForm";
import { signInWithApple, signInWithGoogle } from "components/LoginSignUp/loginFormHelpers";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  ...jest.requireActual( "components/LoginSignUp/AuthenticationService" ),
  authenticateUser: jest.fn( ),
} ) );

jest.mock( "components/LoginSignUp/loginFormHelpers", ( ) => ( {
  signInWithApple: jest.fn( ),
  signInWithGoogle: jest.fn( ),
} ) );

const actor = userEvent.setup( );

describe( "LoginForm", ( ) => {
  it.each( [
    ["Apple", signInWithApple, "ThirdPartySignIn.apple"],
    ["Google", signInWithGoogle, "ThirdPartySignIn.google"],
  ] )( "shows no error when %s sign-in doesn't succeed", async ( _provider, signIn, testID ) => {
    signIn.mockResolvedValueOnce( { success: false } );
    renderComponent( <LoginForm /> );
    await actor.press( screen.getByTestId( testID ) );
    expect( signIn ).toHaveBeenCalled( );
    expect( screen.queryByText( i18next.t( "Failed-to-log-in" ) ) ).toBeNull( );
  } );

  it( "re-enables the sign-in buttons if a provider helper throws", async ( ) => {
    signInWithGoogle.mockRejectedValueOnce( new Error( "activity is null" ) );
    renderComponent( <LoginForm /> );
    const googleButton = screen.getByTestId( "ThirdPartySignIn.google" );
    await actor.press( googleButton );
    expect( signInWithGoogle ).toHaveBeenCalled( );
    expect( googleButton ).toBeEnabled( );
  } );

  it( "shows an error when username/password login fails", async ( ) => {
    authenticateUser.mockResolvedValueOnce( { success: false } );
    renderComponent( <LoginForm /> );
    await actor.type( screen.getByTestId( "Login.email" ), "someone" );
    await actor.type( screen.getByTestId( "Login.password" ), "a-wrong-password" );
    await actor.press( screen.getByTestId( "Login.loginButton" ) );
    expect( await screen.findByText( i18next.t( "Failed-to-log-in" ) ) ).toBeVisible( );
  } );
} );
