import { useNavigation } from "@react-navigation/native";
import { screen, userEvent } from "@testing-library/react-native";
import { emailAvailable } from "components/LoginSignUp/AuthenticationService";
import SignUpForm from "components/LoginSignUp/SignUpForm";
import i18next from "i18next";
import React from "react";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  ...jest.requireActual( "components/LoginSignUp/AuthenticationService" ),
  emailAvailable: jest.fn( ( ) => Promise.resolve( true ) ),
} ) );

const mockNavigate = jest.fn( );

jest.mock( "@react-navigation/native", ( ) => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useNavigation: jest.fn( ),
} ) );

const actor = userEvent.setup( );
const invalidEmailError = ( ) => i18next.t( "Please-enter-a-valid-email-address" );

describe( "SignUpForm", ( ) => {
  beforeEach( ( ) => {
    emailAvailable.mockClear( );
    mockNavigate.mockClear( );
    useNavigation.mockReturnValue( {
      addListener: jest.fn( ( ) => jest.fn( ) ),
      navigate: mockNavigate,
    } );
  } );

  it( "shows an error and stays when the email isn't valid", async ( ) => {
    renderComponent( <SignUpForm /> );
    await actor.type( screen.getByTestId( "Signup.email" ), "test@email" );
    await actor.press( screen.getByTestId( "Signup.signupButton" ) );
    expect( await screen.findByText( invalidEmailError( ) ) ).toBeVisible( );
    expect( emailAvailable ).not.toHaveBeenCalled( );
    expect( mockNavigate ).not.toHaveBeenCalled( );
  } );

  it( "clears the invalid email error on edit", async ( ) => {
    renderComponent( <SignUpForm /> );
    const emailField = screen.getByTestId( "Signup.email" );
    await actor.type( emailField, "test@email" );
    await actor.press( screen.getByTestId( "Signup.signupButton" ) );
    expect( await screen.findByText( invalidEmailError( ) ) ).toBeVisible( );
    await actor.type( emailField, ".com" );
    expect( screen.queryByText( invalidEmailError( ) ) ).toBeNull( );
  } );

  it( "continues with the trimmed email when it's valid", async ( ) => {
    renderComponent( <SignUpForm /> );
    await actor.type( screen.getByTestId( "Signup.email" ), " new@example.com " );
    await actor.press( screen.getByTestId( "Signup.signupButton" ) );
    expect( emailAvailable ).toHaveBeenCalledWith( "new@example.com" );
    expect( mockNavigate ).toHaveBeenCalledWith( "SignUpConfirmation", {
      user: { email: "new@example.com" },
    } );
  } );

  it( "continues with an internationalized domain converted to punycode", async ( ) => {
    renderComponent( <SignUpForm /> );
    await actor.type( screen.getByTestId( "Signup.email" ), "anna@bücher.de" );
    await actor.press( screen.getByTestId( "Signup.signupButton" ) );
    expect( emailAvailable ).toHaveBeenCalledWith( "anna@xn--bcher-kva.de" );
    expect( mockNavigate ).toHaveBeenCalledWith( "SignUpConfirmation", {
      user: { email: "anna@xn--bcher-kva.de" },
    } );
  } );
} );
