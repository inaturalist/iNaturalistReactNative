import {
  screen, userEvent,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { Image } from "react-native";
import { renderApp } from "tests/helpers/render";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

jest.mock( "sharedHelpers/installData", ( ) => {
  const actual = jest.requireActual( "sharedHelpers/installData" );
  const { useState } = jest.requireActual( "react" );
  return {
    ...actual,
    useOnboardingShown: ( ) => {
      const [shown, setShown] = useState( false );
      return [shown, setShown];
    },
    getInstallID: jest.fn( ( ) => "fake-installation-id" ),
    getEnvironmentOverride: jest.fn( ( ) => undefined ),
    setEnvironmentOverride: jest.fn( ( ) => { } ),
  };
} );

jest.mock( "components/LoginSignUp/AuthenticationService", ( ) => ( {
  ...jest.requireActual( "components/LoginSignUp/AuthenticationService" ),
  emailAvailable: jest.fn( ( ) => Promise.resolve( true ) ),
  registerUser: jest.fn( ( ) => Promise.resolve( null ) ),
  authenticateUser: jest.fn( ( ) => Promise.resolve( { success: true } ) ),
} ) );

const actor = userEvent.setup( );

const closeCarousel = async ( ) => {
  await actor.press( await screen.findByLabelText( i18next.t( "Close" ) ) );
};

describe( "Onboarding", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
    jest.spyOn( Image, "prefetch" ).mockResolvedValue( true );
  } );

  it( "shows the login screen after the carousel is closed", async ( ) => {
    renderApp( );
    await closeCarousel( );
    expect( await screen.findByTestId( "Login.email" ) ).toBeVisible( );
    expect( screen.queryByTestId( "OnboardingCarousel" ) ).toBeNull( );
  } );

  it( "shows my observations after closing the login screen", async ( ) => {
    renderApp( );
    await closeCarousel( );
    await screen.findByTestId( "Login.email" );
    await actor.press( screen.getByLabelText( i18next.t( "Close" ) ) );
    expect(
      await screen.findByText( i18next.t( "Use-iNaturalist-to-identify-any-living-thing" ) ),
    ).toBeVisible( );
    expect( screen.queryByTestId( "OnboardingCarousel" ) ).toBeNull( );
  } );

  it( "shows my observations after signing up from the login screen", async ( ) => {
    renderApp( );
    await closeCarousel( );
    await screen.findByTestId( "Login.email" );
    await actor.press( screen.getByText( /Sign up/ ) );
    await actor.type( await screen.findByTestId( "Signup.email" ), "new@example.com" );
    await actor.press( screen.getByTestId( "Signup.signupButton" ) );
    await actor.type( await screen.findByTestId( "Signup.username" ), "newuser" );
    await actor.type( screen.getByTestId( "Signup.password" ), "a-good-password" );
    await actor.press( screen.getByLabelText( i18next.t( "I-agree-to-the-Terms-of-Use" ) ) );
    await actor.press( screen.getByTestId( "SignUpConfirmationForm.signupButton" ) );
    expect(
      await screen.findByText( i18next.t( "Use-iNaturalist-to-identify-any-living-thing" ) ),
    ).toBeVisible( );
  } );
} );
