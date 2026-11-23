import { NavigationContainerRefContext } from "@react-navigation/native";
import {
  act, screen, userEvent, waitFor, within,
} from "@testing-library/react-native";
import {
  authenticateUser,
  emailAvailable,
  registerUser,
} from "components/LoginSignUp/AuthenticationService";
import { signInWithGoogle } from "components/LoginSignUp/loginFormHelpers";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import RootStackNavigator from "navigation/RootStackNavigator";
import React, { useContext } from "react";
import { BackHandler, Image } from "react-native";
import { requestMultiple, RESULTS } from "react-native-permissions";
import { LOCATION_PERMISSIONS } from "sharedHelpers/permissions";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import factory from "tests/factory";
import { renderApp, renderAppWithComponent } from "tests/helpers/render";
import setStoreStateFeatureFlags from "tests/helpers/setStoreStateFeatureFlags";
import { signIn, signOut } from "tests/helpers/user";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// Shared across every caller, like the real MMKV-backed hook, so the root
// navigator sees the carousel set the flag
const mockOnboarding = { shown: false, listeners: new Set( ) };
jest.mock( "sharedHelpers/installData", ( ) => {
  const actual = jest.requireActual( "sharedHelpers/installData" );
  const { useCallback, useEffect, useState } = jest.requireActual( "react" );
  return {
    ...actual,
    useOnboardingShown: ( ) => {
      const [shown, setShown] = useState( mockOnboarding.shown );
      useEffect( ( ) => {
        const listener = ( ) => setShown( mockOnboarding.shown );
        mockOnboarding.listeners.add( listener );
        listener( );
        return ( ) => { mockOnboarding.listeners.delete( listener ); };
      }, [] );
      const setOnboardingShown = useCallback( value => {
        mockOnboarding.shown = value;
        mockOnboarding.listeners.forEach( listener => listener( ) );
      }, [] );
      return [shown, setOnboardingShown];
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
  resetPassword: jest.fn( ( ) => Promise.resolve( ) ),
} ) );

// Stands in for the Apple and Google sheets and the iNat sign-in behind them
jest.mock( "components/LoginSignUp/loginFormHelpers", ( ) => ( {
  signInWithApple: jest.fn( ),
  signInWithGoogle: jest.fn( ),
} ) );

// userEvent holds every press for RN's 130ms minimum press duration, so fake
// timers let presses advance the clock instead of sleeping. They're enabled
// per test because initI18next in beforeAll waits on a real timer.
const actor = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

const closeCarousel = async ( ) => {
  await actor.press( await screen.findByLabelText( i18next.t( "Close" ) ) );
};

describe( "Onboarding", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
    jest.spyOn( Image, "prefetch" ).mockResolvedValue( true );
  } );

  beforeEach( ( ) => {
    jest.useFakeTimers( );
    mockOnboarding.shown = false;
  } );

  afterEach( ( ) => {
    jest.useRealTimers( );
  } );

  it( "shows the login screen after the carousel is closed", async ( ) => {
    renderApp( );
    await closeCarousel( );
    expect( await screen.findByTestId( "Login.email" ) ).toBeVisible( );
    expect( screen.queryByTestId( "OnboardingCarousel" ) ).toBeNull( );
    expect( mockOnboarding.shown ).toBe( true );
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

describe( "Onboarding with OnboardingV2Enabled", ( ) => {
  // [step, shows progress bar, has a close button]
  const STEPS_IN_ORDER = [
    ["welcome", false, false],
    ["obs_story", true, true],
    ["community_id", true, true],
    ["research_grade", true, true],
    ["impact", true, true],
    ["signup_email", false, true],
    ["signup_credentials", false, true],
    ["location_explainer", true, false],
  ];
  const STEP_IDS = STEPS_IN_ORDER.map( ( [stepId] ) => stepId );

  const enterEmail = async email => {
    const step = await screen.findByTestId( "Onboarding.signup_email" );
    await actor.type( within( step ).getByTestId( "Onboarding.signup_email.email" ), email );
  };

  const enterCredentials = async ( username, password ) => {
    const step = await screen.findByTestId( "Onboarding.signup_credentials" );
    await actor.type(
      within( step ).getByTestId( "Onboarding.signup_credentials.username" ),
      username,
    );
    await actor.type(
      within( step ).getByTestId( "Onboarding.signup_credentials.password" ),
      password,
    );
  };

  const agreeToTerms = async ( ) => {
    const step = await screen.findByTestId( "Onboarding.signup_credentials" );
    await actor.press(
      within( step ).getByLabelText(
        "I agree to the Terms of Use and Privacy Policy, and I have reviewed the Community "
        + "Guidelines (required).",
      ),
    );
  };

  const continueFrom = async stepId => {
    if ( stepId === "signup_email" ) await enterEmail( "new@example.com" );
    if ( stepId === "signup_credentials" ) {
      await enterCredentials( "newuser", "a-good-password" );
      await agreeToTerms( );
    }
    const step = await screen.findByTestId( `Onboarding.${stepId}` );
    await actor.press( within( step ).getByTestId( `Onboarding.${stepId}.next` ) );
  };

  const continueTo = async targetStepId => {
    // eslint-disable-next-line no-restricted-syntax
    for ( const stepId of STEP_IDS.slice( 0, STEP_IDS.indexOf( targetStepId ) ) ) {
      // eslint-disable-next-line no-await-in-loop
      await continueFrom( stepId );
    }
    return screen.findByTestId( `Onboarding.${targetStepId}` );
  };

  const continueToLocationStep = ( ) => continueTo( "location_explainer" );

  const openExitSheet = async stepId => {
    const step = await screen.findByTestId( `Onboarding.${stepId}` );
    await actor.press( within( step ).getByTestId( `Onboarding.${stepId}.close` ) );
    return screen.findByTestId( `Onboarding.${stepId}.exitSheet` );
  };

  const confirmExit = async ( stepId, confirmText ) => {
    const sheet = await openExitSheet( stepId );
    await actor.press( within( sheet ).getByText( i18next.t( confirmText ) ) );
  };

  const logInFrom = async stepId => {
    const step = await screen.findByTestId( `Onboarding.${stepId}` );
    await actor.press( within( step ).getByTestId( `Onboarding.${stepId}.logIn` ) );
    return screen.findByTestId( "Login.email" );
  };

  const logIn = async ( ) => {
    await actor.type( await screen.findByTestId( "Login.email" ), "someone" );
    await actor.type( screen.getByTestId( "Login.password" ), "a-good-password" );
    await actor.press( screen.getByTestId( "Login.loginButton" ) );
  };

  const closeLogin = async ( ) => {
    await screen.findByTestId( "Login.email" );
    await actor.press( screen.getByLabelText( i18next.t( "Close" ) ) );
  };

  const signUpFromLogin = async ( ) => {
    await screen.findByTestId( "Login.email" );
    await actor.press( screen.getByText( /Sign up/ ) );
  };

  const resetPasswordAndGoBackToLogin = async ( ) => {
    await screen.findByTestId( "Login.email" );
    await actor.press( screen.getByText( i18next.t( "Forgot-Password" ) ) );
    const resetButton = await screen.findByTestId( "Login.forgotPasswordButton" );
    await actor.type( screen.getByTestId( "Login.email" ), "someone@example.com" );
    await actor.press( resetButton );
    await actor.press( await screen.findByText( i18next.t( "BACK-TO-LOGIN" ) ) );
  };

  const findMyObservations = ( ) => screen.findByText(
    i18next.t( "Use-iNaturalist-to-identify-any-living-thing" ),
  );

  // Default queries skip screens covered by another stack screen, so they
  // can't see a screen left mounted underneath
  const queryMounted = testID => screen.queryByTestId( testID, { includeHiddenElements: true } );

  const renderAppWithNavigationContainer = ( ) => {
    const container = { current: null };
    const ContainerProbe = ( ) => {
      container.current = useContext( NavigationContainerRefContext );
      return null;
    };
    renderAppWithComponent(
      <>
        <ContainerProbe />
        <RootStackNavigator />
      </>,
    );
    return { navigationContainer: container };
  };

  const locationResults = status => Object.fromEntries(
    LOCATION_PERMISSIONS.map( permission => [permission, status] ),
  );

  // BackHandler is a no-op outside Android, so record listeners and dispatch
  // to them the way Android does: newest first, stopping at the first one
  // that handles the press. Returns false when nothing handled it, which on
  // a device means the OS closes the app.
  let addBackListener;
  const mockHardwareBack = ( ) => {
    const listeners = [];
    addBackListener = jest.spyOn( BackHandler, "addEventListener" )
      .mockImplementation( ( eventName, listener ) => {
        if ( eventName === "hardwareBackPress" ) listeners.push( listener );
        return {
          remove: ( ) => {
            const index = listeners.indexOf( listener );
            if ( index !== -1 ) listeners.splice( index, 1 );
          },
        };
      } );
    return ( ) => {
      let handled;
      act( ( ) => {
        handled = [...listeners].reverse( ).some( listener => listener( ) );
      } );
      return handled;
    };
  };

  beforeAll( async ( ) => {
    await initI18next( );
    jest.spyOn( Image, "prefetch" ).mockResolvedValue( true );
  } );

  beforeEach( ( ) => {
    jest.useFakeTimers( );
    mockOnboarding.shown = false;
    setStoreStateFeatureFlags( { [FeatureFlag.OnboardingV2Enabled]: true } );
    requestMultiple.mockReset( );
    requestMultiple.mockImplementation(
      ( ) => Promise.resolve( locationResults( RESULTS.GRANTED ) ),
    );
    emailAvailable.mockClear( );
    registerUser.mockClear( );
    authenticateUser.mockClear( );
    signInWithGoogle.mockReset( );
    signInWithGoogle.mockResolvedValue( { success: true } );
  } );

  afterEach( ( ) => {
    jest.useRealTimers( );
    setStoreStateFeatureFlags( { } );
    addBackListener?.mockRestore( );
    addBackListener = undefined;
  } );

  it( "shows the welcome step instead of the carousel", async ( ) => {
    renderApp( );
    expect( await screen.findByTestId( "Onboarding.welcome" ) ).toBeVisible( );
    expect( screen.queryByTestId( "OnboardingCarousel" ) ).toBeNull( );
  } );

  it(
    "visits each step in order (progress on education and location steps, close on demo and "
    + "sign-up steps), asks for location, then shows my observations",
    async ( ) => {
      renderApp( );
      // eslint-disable-next-line no-restricted-syntax
      for ( const [stepId, showsProgress, hasClose] of STEPS_IN_ORDER ) {
        // eslint-disable-next-line no-await-in-loop
        const step = await screen.findByTestId( `Onboarding.${stepId}` );
        if ( showsProgress ) {
          expect( within( step ).getByTestId( "Onboarding.progress" ) ).toBeVisible( );
        } else {
          expect( within( step ).queryByTestId( "Onboarding.progress" ) ).toBeNull( );
        }
        if ( hasClose ) {
          expect( within( step ).getByTestId( `Onboarding.${stepId}.close` ) ).toBeVisible( );
        } else {
          expect( within( step ).queryByTestId( `Onboarding.${stepId}.close` ) ).toBeNull( );
        }
        // eslint-disable-next-line no-await-in-loop
        await continueFrom( stepId );
      }
      expect( requestMultiple ).toHaveBeenCalledWith( LOCATION_PERMISSIONS );
      expect( await findMyObservations( ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.welcome" ) ).toBeNull( );
      expect( mockOnboarding.shown ).toBe( true );
    },
  );

  it.each( [
    ["denied", ( ) => Promise.resolve( locationResults( RESULTS.DENIED ) )],
    ["not requested because of an error", ( ) => Promise.reject( new Error( "request failed" ) )],
  ] )( "shows my observations when location is %s", async ( _outcome, request ) => {
    requestMultiple.mockImplementationOnce( request );
    renderApp( );
    await continueToLocationStep( );
    await continueFrom( "location_explainer" );
    expect( await findMyObservations( ) ).toBeVisible( );
    expect( mockOnboarding.shown ).toBe( true );
  } );

  it( "can't swipe back from the location step", async ( ) => {
    const { navigationContainer } = renderAppWithNavigationContainer( );
    await continueToLocationStep( );
    expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
    expect( navigationContainer.current.getCurrentOptions( ).gestureEnabled ).toBe( false );
  } );

  it( "stays on the location step when the Android back button is pressed", async ( ) => {
    const pressHardwareBack = mockHardwareBack( );
    renderApp( );
    await continueToLocationStep( );
    expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
    expect( pressHardwareBack( ) ).toBe( true );
    expect( screen.getByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
    expect( screen.queryByTestId( "Onboarding.signup_credentials" ) ).toBeNull( );
  } );

  it(
    "goes back one step at a time by swipe or back button, from impact to welcome",
    async ( ) => {
      const { navigationContainer } = renderAppWithNavigationContainer( );
      const impactIndex = STEP_IDS.indexOf( "impact" );
      // eslint-disable-next-line no-restricted-syntax
      for ( const stepId of STEP_IDS.slice( 0, impactIndex ) ) {
        // eslint-disable-next-line no-await-in-loop
        await continueFrom( stepId );
      }
      expect( await screen.findByTestId( "Onboarding.impact" ) ).toBeVisible( );

      for ( let i = impactIndex; i > 0; i -= 1 ) {
        expect( navigationContainer.current.getCurrentOptions( ).gestureEnabled ).not.toBe( false );
        // Stands in for the back gesture and Android back button, which both
        // pop the step stack and can't be performed in jest
        act( ( ) => navigationContainer.current.goBack( ) );
        expect( screen.queryByTestId( `Onboarding.${STEP_IDS[i]}` ) ).toBeNull( );
        expect( screen.getByTestId( `Onboarding.${STEP_IDS[i - 1]}` ) ).toBeVisible( );
      }
    },
  );

  describe( "relaunching after signing in during onboarding", ( ) => {
    beforeEach( async ( ) => {
      await signIn( factory( "LocalUser" ) );
    } );

    afterEach( async ( ) => {
      await signOut( );
    } );

    it( "resumes at the location step, where Android back leaves the app", async ( ) => {
      const pressHardwareBack = mockHardwareBack( );
      renderApp( );
      expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
      expect( queryMounted( "Onboarding.welcome" ) ).toBeNull( );
      expect( pressHardwareBack( ) ).toBe( false );
    } );

    it( "resumes at the location step when the flag turns on after launch", async ( ) => {
      setStoreStateFeatureFlags( { } );
      renderApp( );
      expect( await screen.findByTestId( "OnboardingCarousel" ) ).toBeVisible( );
      setStoreStateFeatureFlags( { [FeatureFlag.OnboardingV2Enabled]: true } );
      expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
      expect( queryMounted( "Onboarding.welcome" ) ).toBeNull( );
    } );
  } );

  describe( "exit sheets", ( ) => {
    it( "asks before exiting the demo, and cancelling stays on the step", async ( ) => {
      renderApp( );
      await continueTo( "community_id" );
      const sheet = await openExitSheet( "community_id" );
      expect(
        within( sheet ).getByText( i18next.t( "You-can-always-revisit-this-later-in-settings" ) ),
      ).toBeVisible( );
      await actor.press( within( sheet ).getByText( i18next.t( "CANCEL" ) ) );
      expect( screen.queryByTestId( "Onboarding.community_id.exitSheet" ) ).toBeNull( );
      expect( screen.getByTestId( "Onboarding.community_id" ) ).toBeVisible( );
    } );

    it( "exits the demo to sign-up, and going back resumes the demo", async ( ) => {
      const { navigationContainer } = renderAppWithNavigationContainer( );
      await continueTo( "community_id" );
      await confirmExit( "community_id", "YES-EXIT" );
      expect( await screen.findByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
      act( ( ) => navigationContainer.current.goBack( ) );
      expect( screen.queryByTestId( "Onboarding.signup_email" ) ).toBeNull( );
      expect( screen.getByTestId( "Onboarding.community_id" ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.community_id.exitSheet" ) ).toBeNull( );
    } );

    it( "exits sign-up to the location step", async ( ) => {
      renderApp( );
      await continueTo( "signup_email" );
      const sheet = await openExitSheet( "signup_email" );
      expect( within( sheet ).getByText( i18next.t(
        "You-can-only-get-identifications-from-other-people-by-creating-an-account",
      ) ) ).toBeVisible( );
      await actor.press( within( sheet ).getByText( i18next.t( "EXIT" ) ) );
      expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
    } );
  } );

  describe( "logging in and signing up", ( ) => {
    it.each( ["welcome", "signup_email"] )(
      "returns to the %s step when Login opened there is closed",
      async stepId => {
        renderApp( );
        await continueTo( stepId );
        await logInFrom( stepId );
        await closeLogin( );
        expect( await screen.findByTestId( `Onboarding.${stepId}` ) ).toBeVisible( );
        expect( queryMounted( "Login.email" ) ).toBeNull( );
        expect( mockOnboarding.shown ).toBeFalsy( );
      },
    );

    it( "shows the location step after logging in from welcome", async ( ) => {
      renderApp( );
      await logInFrom( "welcome" );
      await logIn( );
      expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
      expect( queryMounted( "Login.email" ) ).toBeNull( );
    } );

    it( "returns to the sign-up email step via Sign up in Login opened there", async ( ) => {
      const { navigationContainer } = renderAppWithNavigationContainer( );
      await continueTo( "signup_email" );
      await logInFrom( "signup_email" );
      await signUpFromLogin( );
      expect( await screen.findByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
      expect( queryMounted( "Login.email" ) ).toBeNull( );
      expect(
        screen.getAllByTestId( "Onboarding.signup_email", { includeHiddenElements: true } ),
      ).toHaveLength( 1 );
      act( ( ) => navigationContainer.current.goBack( ) );
      expect( screen.getByTestId( "Onboarding.impact" ) ).toBeVisible( );
    } );

    it( "opens the onboarding sign-up step from Login opened on welcome", async ( ) => {
      renderApp( );
      await logInFrom( "welcome" );
      await signUpFromLogin( );
      expect( await screen.findByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
      expect( queryMounted( "Signup.email" ) ).toBeNull( );
      expect( queryMounted( "Login.email" ) ).toBeNull( );
    } );

    it(
      "shows the location step after logging in from welcome by way of a password reset",
      async ( ) => {
        renderApp( );
        await logInFrom( "welcome" );
        await resetPasswordAndGoBackToLogin( );
        await logIn( );
        expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
        expect( screen.queryByTestId( "Login.email" ) ).toBeNull( );
      },
    );

    it( "leaves Login when going back after a password reset", async ( ) => {
      const { navigationContainer } = renderAppWithNavigationContainer( );
      await logInFrom( "welcome" );
      await resetPasswordAndGoBackToLogin( );
      await screen.findByTestId( "Login.loginButton" );
      act( ( ) => navigationContainer.current.goBack( ) );
      expect( await screen.findByTestId( "Onboarding.welcome" ) ).toBeVisible( );
      expect( queryMounted( "Login.email" ) ).toBeNull( );
    } );

    it( "closes Login after logging in once onboarding is done", async ( ) => {
      mockOnboarding.shown = true;
      renderApp( );
      await findMyObservations( );
      await actor.press( screen.getByText( i18next.t( "Already-have-an-iNaturalist-account" ) ) );
      await logIn( );
      expect( await findMyObservations( ) ).toBeVisible( );
      expect( queryMounted( "Login.email" ) ).toBeNull( );
      expect( queryMounted( "Onboarding.location_explainer" ) ).toBeNull( );
    } );

    it( "opens the existing sign-up form from Login once onboarding is done", async ( ) => {
      mockOnboarding.shown = true;
      renderApp( );
      await findMyObservations( );
      await actor.press( screen.getByText( i18next.t( "Already-have-an-iNaturalist-account" ) ) );
      await signUpFromLogin( );
      expect( await screen.findByTestId( "Signup.email" ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.signup_email" ) ).toBeNull( );
    } );
  } );

  describe( "sign-up email step", ( ) => {
    const findEmailStep = ( ) => screen.findByTestId( "Onboarding.signup_email" );
    const continueButton = ( ) => screen.getByTestId( "Onboarding.signup_email.next" );

    it( "disables Continue until an email is entered", async ( ) => {
      renderApp( );
      await continueTo( "signup_email" );
      expect( continueButton( ) ).toBeDisabled( );
      await enterEmail( "   " );
      expect( continueButton( ) ).toBeDisabled( );
      await enterEmail( "new@example.com" );
      expect( continueButton( ) ).toBeEnabled( );
    } );

    it(
      "passes the trimmed email to the username/password step, and going back keeps it",
      async ( ) => {
        const { navigationContainer } = renderAppWithNavigationContainer( );
        await continueTo( "signup_email" );
        await enterEmail( " new@example.com " );
        await actor.press( continueButton( ) );
        expect( await screen.findByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
        expect( emailAvailable ).toHaveBeenCalledWith( "new@example.com" );
        expect( navigationContainer.current.getCurrentRoute( ).params ).toEqual( {
          email: "new@example.com",
        } );
        act( ( ) => navigationContainer.current.goBack( ) );
        expect( await findEmailStep( ) ).toBeVisible( );
        // Button ignores presses for a moment after each one
        await waitFor( ( ) => expect( continueButton( ) ).toBeEnabled( ) );
      },
    );

    it(
      "passes an internationalized domain to the username/password step as punycode",
      async ( ) => {
        const { navigationContainer } = renderAppWithNavigationContainer( );
        await continueTo( "signup_email" );
        await enterEmail( "anna@bücher.de" );
        await actor.press( continueButton( ) );
        expect( await screen.findByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
        expect( emailAvailable ).toHaveBeenCalledWith( "anna@xn--bcher-kva.de" );
        expect( navigationContainer.current.getCurrentRoute( ).params ).toEqual( {
          email: "anna@xn--bcher-kva.de",
        } );
      },
    );

    it( "shows an error and stays when the email is already in use", async ( ) => {
      emailAvailable.mockResolvedValueOnce( false );
      renderApp( );
      await continueTo( "signup_email" );
      await enterEmail( "taken@example.com" );
      await actor.press( continueButton( ) );
      expect( await screen.findByText(
        i18next.t( "That-email-is-already-associated-with-an-account" ),
      ) ).toBeVisible( );
      expect( screen.getByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.signup_credentials" ) ).toBeNull( );
    } );

    it( "shows an error and stays when the email isn't valid, and clears it on edit", async ( ) => {
      renderApp( );
      await continueTo( "signup_email" );
      await enterEmail( "test@email" );
      await actor.press( continueButton( ) );
      const invalidEmailError = i18next.t( "Please-enter-a-valid-email-address" );
      expect( await screen.findByText( invalidEmailError ) ).toBeVisible( );
      expect( emailAvailable ).not.toHaveBeenCalled( );
      expect( screen.getByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.signup_credentials" ) ).toBeNull( );
      await enterEmail( ".com" );
      expect( screen.queryByText( invalidEmailError ) ).toBeNull( );
    } );

    it(
      "shows a connection error when the email can't be checked, and clears it on edit",
      async ( ) => {
        emailAvailable.mockRejectedValueOnce( new Error( "Network request failed" ) );
        renderApp( );
        await continueTo( "signup_email" );
        await enterEmail( "new@example.com" );
        await actor.press( continueButton( ) );
        const connectionError = i18next.t( "Connection-problem-Please-try-again-later" );
        expect( await screen.findByText( connectionError ) ).toBeVisible( );
        await enterEmail( "x" );
        expect( screen.queryByText( connectionError ) ).toBeNull( );
      },
    );

    it( "clears a connection error when Continue is pressed again", async ( ) => {
      let finishRetry;
      emailAvailable
        .mockRejectedValueOnce( new Error( "Network request failed" ) )
        .mockReturnValueOnce( new Promise( resolve => { finishRetry = resolve; } ) );
      renderApp( );
      await continueTo( "signup_email" );
      await enterEmail( "new@example.com" );
      await actor.press( continueButton( ) );
      const connectionError = i18next.t( "Connection-problem-Please-try-again-later" );
      expect( await screen.findByText( connectionError ) ).toBeVisible( );
      // Button ignores presses for a moment after each one
      await waitFor( ( ) => expect( continueButton( ) ).toBeEnabled( ) );
      await actor.press( continueButton( ) );
      expect( screen.queryByText( connectionError ) ).toBeNull( );
      await act( async ( ) => finishRetry( true ) );
      expect( await screen.findByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
    } );

    it( "locks the email field while the email is being checked", async ( ) => {
      let finishCheck;
      emailAvailable.mockReturnValueOnce( new Promise( resolve => { finishCheck = resolve; } ) );
      renderApp( );
      await continueTo( "signup_email" );
      await enterEmail( "taken@example.com" );
      await actor.press( continueButton( ) );
      const emailField = screen.getByTestId( "Onboarding.signup_email.email" );
      expect( emailField ).toBeDisabled( );
      await act( async ( ) => finishCheck( false ) );
      expect( emailField ).toBeEnabled( );
    } );

    it( "stays where the user went back to when the check finishes afterward", async ( ) => {
      let finishCheck;
      emailAvailable.mockReturnValueOnce( new Promise( resolve => { finishCheck = resolve; } ) );
      renderApp( );
      await continueTo( "signup_email" );
      await enterEmail( "new@example.com" );
      await actor.press( continueButton( ) );
      await actor.press( screen.getByTestId( "Onboarding.signup_email.back" ) );
      expect( await screen.findByTestId( "Onboarding.impact" ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.signup_email" ) ).toBeNull( );
      await act( async ( ) => finishCheck( true ) );
      expect( screen.getByTestId( "Onboarding.impact" ) ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.signup_credentials" ) ).toBeNull( );
    } );

    it( "holds off Continue and the Google button while signing in with Google", async ( ) => {
      let finishSignIn;
      signInWithGoogle.mockReturnValueOnce( new Promise( resolve => { finishSignIn = resolve; } ) );
      renderApp( );
      await continueTo( "signup_email" );
      await enterEmail( "new@example.com" );
      const googleButton = screen.getByTestId( "ThirdPartySignIn.google" );
      await actor.press( googleButton );
      expect( continueButton( ) ).toBeDisabled( );
      expect( googleButton ).toBeDisabled( );
      await act( async ( ) => finishSignIn( { success: false } ) );
      expect( continueButton( ) ).toBeEnabled( );
      expect( googleButton ).toBeEnabled( );
      expect( screen.queryByTestId( "Onboarding.location_explainer" ) ).toBeNull( );
    } );

    describe( "signing in with Google", ( ) => {
      beforeEach( ( ) => {
        signInWithGoogle.mockImplementation( async ( ) => {
          await signIn( factory( "LocalUser" ) );
          return { success: true };
        } );
      } );

      afterEach( async ( ) => {
        await signOut( );
      } );

      it( "shows the location step after signing in during onboarding", async ( ) => {
        renderApp( );
        await continueTo( "signup_email" );
        await actor.press( screen.getByTestId( "ThirdPartySignIn.google" ) );
        expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
        expect( screen.queryByTestId( "Onboarding.signup_email" ) ).toBeNull( );
        expect( mockOnboarding.shown ).toBe( false );
      } );

      it( "shows the location step when signing in turns OnboardingV2Enabled off", async ( ) => {
        signInWithGoogle.mockImplementationOnce( async ( ) => {
          await signIn( factory( "LocalUser" ) );
          setStoreStateFeatureFlags( { } );
          return { success: true };
        } );
        renderApp( );
        await continueTo( "signup_email" );
        await actor.press( screen.getByTestId( "ThirdPartySignIn.google" ) );
        expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
        expect( screen.queryByTestId( "OnboardingCarousel" ) ).toBeNull( );
      } );
    } );
  } );

  describe( "sign-up username/password step", ( ) => {
    const createButton = ( ) => screen.getByTestId( "Onboarding.signup_credentials.next" );
    const backButton = ( ) => screen.getByTestId( "Onboarding.signup_credentials.back" );
    const findCredentialsStep = ( ) => screen.findByTestId( "Onboarding.signup_credentials" );

    const submitCredentials = async ( ) => {
      await continueTo( "signup_credentials" );
      await enterCredentials( "newuser", "a-good-password" );
      await agreeToTerms( );
      await actor.press( createButton( ) );
    };

    // Leaving is locked while the account is being created, so the user can
    // only go back once the lock has expired
    const goBackOnceStalled = async ( ) => {
      act( ( ) => jest.advanceTimersByTime( 15_000 ) );
      await actor.press( backButton( ) );
      return screen.findByTestId( "Onboarding.signup_email" );
    };

    it( "disables the create button until everything is provided", async ( ) => {
      renderApp( );
      await continueTo( "signup_credentials" );
      expect( createButton( ) ).toBeDisabled( );
      await enterCredentials( "   ", "a-good-password" );
      await agreeToTerms( );
      expect( createButton( ) ).toBeDisabled( );
      await enterCredentials( "newuser", "" );
      expect( createButton( ) ).toBeEnabled( );
      await agreeToTerms( );
      expect( createButton( ) ).toBeDisabled( );
      await actor.press( screen.getByText( /I agree to the Terms of Use/ ) );
      expect( createButton( ) ).toBeEnabled( );
    } );

    describe( "signing in to the new account", ( ) => {
      beforeEach( ( ) => {
        authenticateUser.mockImplementationOnce( async ( ) => {
          await signIn( factory( "LocalUser" ) );
          return { success: true };
        } );
      } );

      afterEach( async ( ) => {
        await signOut( );
      } );

      it( "creates the account with the email step's email, then shows location", async ( ) => {
        renderApp( );
        await continueTo( "signup_credentials" );
        await enterCredentials( " newuser ", "a-good-password" );
        await agreeToTerms( );
        await actor.press( createButton( ) );
        expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
        expect( registerUser ).toHaveBeenCalledWith( expect.objectContaining( {
          email: "new@example.com",
          login: "newuser",
          password: "a-good-password",
          pi_consent: true,
          data_transfer_consent: true,
        } ) );
        expect( authenticateUser ).toHaveBeenCalledWith(
          "newuser",
          "a-good-password",
          expect.anything( ),
        );
        expect( mockOnboarding.shown ).toBe( false );
      } );
    } );

    it.each( [
      [
        "shorter than 6 characters",
        "abc12",
        "Please-make-sure-your-password-is-at-least-6-characters",
      ],
      ["\"password\" in any case", "PassWord", "Please-choose-a-different-password"],
    ] )( "refuses a password that is %s", async ( _description, password, errorKey ) => {
      renderApp( );
      await continueTo( "signup_credentials" );
      await enterCredentials( "newuser", password );
      await agreeToTerms( );
      await actor.press( createButton( ) );
      expect( await screen.findByText( i18next.t( errorKey ) ) ).toBeVisible( );
      expect( registerUser ).not.toHaveBeenCalled( );
      expect( screen.getByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
    } );

    it( "says a taken username is unavailable, and clears the error on edit", async ( ) => {
      registerUser.mockResolvedValueOnce( "Username has already been taken" );
      renderApp( );
      await continueTo( "signup_credentials" );
      await enterCredentials( "taken", "a-good-password" );
      await agreeToTerms( );
      await actor.press( createButton( ) );
      expect( await screen.findByText( "That username is unavailable" ) ).toBeVisible( );
      expect( authenticateUser ).not.toHaveBeenCalled( );
      expect( screen.getByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
      await enterCredentials( "2", "" );
      expect( screen.queryByText( "That username is unavailable" ) ).toBeNull( );
    } );

    it( "shows the server's own message for other registration errors", async ( ) => {
      registerUser.mockResolvedValueOnce( "Something went wrong" );
      renderApp( );
      await submitCredentials( );
      expect( await screen.findByText( "Something went wrong" ) ).toBeVisible( );
      expect( authenticateUser ).not.toHaveBeenCalled( );
      expect( screen.getByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
    } );

    it( "exits sign-up to the location step without creating an account", async ( ) => {
      renderApp( );
      await continueTo( "signup_credentials" );
      await confirmExit( "signup_credentials", "EXIT" );
      expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
      expect( registerUser ).not.toHaveBeenCalled( );
    } );

    it( "opens Learn More over the step and keeps what was entered", async ( ) => {
      renderApp( );
      await continueTo( "signup_credentials" );
      await enterCredentials( "newuser", "a-good-password" );
      await agreeToTerms( );
      await actor.press( screen.getByText( i18next.t( "Learn-More" ) ) );
      expect( await screen.findByText( i18next.t( "COMMUNITY-GUIDELINES" ) ) ).toBeVisible( );
      await actor.press( screen.getByTestId( "BackButton" ) );
      expect( await findCredentialsStep( ) ).toBeVisible( );
      await waitFor( ( ) => expect( createButton( ) ).toBeEnabled( ) );
    } );

    it.each( [
      ["fails", ( ) => Promise.resolve( { success: false } )],
      ["throws", ( ) => Promise.reject( new Error( "Fetch user without a login" ) )],
    ] )(
      "shows Login over the email step when signing in to the new account %s",
      async ( _how, signInResult ) => {
        authenticateUser.mockImplementationOnce( signInResult );
        renderApp( );
        await submitCredentials( );
        expect( await screen.findByTestId( "Login.email" ) ).toBeVisible( );
        expect( queryMounted( "Onboarding.signup_credentials" ) ).toBeNull( );
        await closeLogin( );
        expect( await screen.findByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
        expect( queryMounted( "Onboarding.signup_credentials" ) ).toBeNull( );
      },
    );

    it( "shows the location step after logging in once sign-in has failed", async ( ) => {
      authenticateUser.mockResolvedValueOnce( { success: false } );
      renderApp( );
      await submitCredentials( );
      await logIn( );
      expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
    } );

    it.each( [
      ["offline", ( ) => Promise.resolve( undefined )],
      ["because the request throws", ( ) => Promise.reject( new Error( "Something broke" ) )],
    ] )(
      "doesn't sign in and unlocks the step when registering fails %s",
      async ( _why, registration ) => {
        registerUser.mockImplementationOnce( registration );
        renderApp( );
        await submitCredentials( );
        expect( await screen.findByText(
          i18next.t( "Connection-problem-Please-try-again-later" ),
        ) ).toBeVisible( );
        expect( authenticateUser ).not.toHaveBeenCalled( );
        expect( screen.getByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
        expect( backButton( ) ).toBeEnabled( );
        expect( queryMounted( "Login.email" ) ).toBeNull( );
      },
    );

    it( "lets the user leave once creating the account has stalled for 15 seconds", async ( ) => {
      registerUser.mockReturnValueOnce( new Promise( ( ) => { } ) );
      const { navigationContainer } = renderAppWithNavigationContainer( );
      await submitCredentials( );
      act( ( ) => jest.advanceTimersByTime( 14_000 ) );
      expect( backButton( ) ).toBeDisabled( );
      act( ( ) => jest.advanceTimersByTime( 1_000 ) );
      expect( backButton( ) ).toBeEnabled( );
      expect( screen.getByTestId( "Onboarding.signup_credentials.close" ) ).toBeEnabled( );
      expect( navigationContainer.current.getCurrentOptions( ).gestureEnabled ).toBe( true );
      await actor.press( backButton( ) );
      expect( await screen.findByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
    } );

    it(
      "locks leaving, Learn More and the fields while the account is being created, and "
      + "unlocks them when that fails",
      async ( ) => {
        let finishRegistration;
        registerUser.mockReturnValueOnce(
          new Promise( resolve => { finishRegistration = resolve; } ),
        );
        const pressHardwareBack = mockHardwareBack( );
        const { navigationContainer } = renderAppWithNavigationContainer( );
        await submitCredentials( );
        expect( backButton( ) ).toBeDisabled( );
        expect( screen.getByTestId( "Onboarding.signup_credentials.close" ) ).toBeDisabled( );
        expect( screen.getByTestId( "Onboarding.signup_credentials.username" ) ).toBeDisabled( );
        expect( screen.getByTestId( "Onboarding.signup_credentials.password" ) ).toBeDisabled( );
        await actor.press( screen.getByText( i18next.t( "Learn-More" ) ) );
        expect( screen.queryByText( i18next.t( "COMMUNITY-GUIDELINES" ) ) ).toBeNull( );
        expect( navigationContainer.current.getCurrentOptions( ).gestureEnabled ).toBe( false );
        expect( pressHardwareBack( ) ).toBe( true );
        expect( screen.getByTestId( "Onboarding.signup_credentials" ) ).toBeVisible( );
        await act( async ( ) => finishRegistration( "Something went wrong" ) );
        expect( await screen.findByText( "Something went wrong" ) ).toBeVisible( );
        expect( backButton( ) ).toBeEnabled( );
        expect( screen.getByTestId( "Onboarding.signup_credentials.username" ) ).toBeEnabled( );
        expect( navigationContainer.current.getCurrentOptions( ).gestureEnabled ).toBe( true );
        pressHardwareBack( );
        expect( await screen.findByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
      },
    );

    it(
      "shows the location step when the account is signed in after the user went back",
      async ( ) => {
        let finishSignIn;
        authenticateUser.mockReturnValueOnce(
          new Promise( resolve => { finishSignIn = resolve; } ),
        );
        renderApp( );
        await submitCredentials( );
        expect( await goBackOnceStalled( ) ).toBeVisible( );
        await act( async ( ) => finishSignIn( { success: true } ) );
        expect( await screen.findByTestId( "Onboarding.location_explainer" ) ).toBeVisible( );
      },
    );

    it(
      "stays on the email step when signing in fails after the user went back",
      async ( ) => {
        let finishSignIn;
        authenticateUser.mockReturnValueOnce(
          new Promise( resolve => { finishSignIn = resolve; } ),
        );
        renderApp( );
        await submitCredentials( );
        expect( await goBackOnceStalled( ) ).toBeVisible( );
        await act( async ( ) => finishSignIn( { success: false } ) );
        expect( screen.getByTestId( "Onboarding.signup_email" ) ).toBeVisible( );
        expect( queryMounted( "Login.email" ) ).toBeNull( );
      },
    );
  } );
} );
