import { NavigationContainerRefContext } from "@react-navigation/native";
import {
  act, screen, userEvent, within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import RootStackNavigator from "navigation/RootStackNavigator";
import React, { useContext } from "react";
import { Image } from "react-native";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import { renderApp, renderAppWithComponent } from "tests/helpers/render";
import setStoreStateFeatureFlags from "tests/helpers/setStoreStateFeatureFlags";

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

  beforeEach( ( ) => {
    mockOnboarding.shown = false;
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
  // [step, shows progress bar]
  const STEPS_IN_ORDER = [
    ["welcome", false],
    ["obs_story", true],
    ["community_id", true],
    ["research_grade", true],
    ["impact", true],
    ["signup_email", false],
    ["signup_credentials", false],
    ["location_explainer", true],
  ];

  const continueFrom = async stepId => {
    const step = await screen.findByTestId( `Onboarding.${stepId}` );
    await actor.press( within( step ).getByTestId( `Onboarding.${stepId}.next` ) );
  };

  beforeAll( async ( ) => {
    await initI18next( );
    jest.spyOn( Image, "prefetch" ).mockResolvedValue( true );
  } );

  beforeEach( ( ) => {
    mockOnboarding.shown = false;
    setStoreStateFeatureFlags( { [FeatureFlag.OnboardingV2Enabled]: true } );
  } );

  afterEach( ( ) => {
    setStoreStateFeatureFlags( { } );
  } );

  it( "shows the welcome step instead of the carousel", async ( ) => {
    renderApp( );
    expect( await screen.findByTestId( "Onboarding.welcome" ) ).toBeVisible( );
    expect( screen.queryByTestId( "OnboardingCarousel" ) ).toBeNull( );
  } );

  it(
    "visits each step in order (progress on education and location steps), then my observations",
    async ( ) => {
      renderApp( );
      // eslint-disable-next-line no-restricted-syntax
      for ( const [stepId, showsProgress] of STEPS_IN_ORDER ) {
        // eslint-disable-next-line no-await-in-loop
        const step = await screen.findByTestId( `Onboarding.${stepId}` );
        if ( showsProgress ) {
          expect( within( step ).getByTestId( "Onboarding.progress" ) ).toBeVisible( );
        } else {
          expect( within( step ).queryByTestId( "Onboarding.progress" ) ).toBeNull( );
        }
        // eslint-disable-next-line no-await-in-loop
        await continueFrom( stepId );
      }
      expect(
        await screen.findByText( i18next.t( "Use-iNaturalist-to-identify-any-living-thing" ) ),
      ).toBeVisible( );
      expect( screen.queryByTestId( "Onboarding.welcome" ) ).toBeNull( );
      expect( mockOnboarding.shown ).toBe( true );
    },
  );

  it(
    "goes back one step at a time by swipe or back button, from impact to the observation story",
    async ( ) => {
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
      const stepIds = STEPS_IN_ORDER.map( ( [stepId] ) => stepId );
      const impactIndex = stepIds.indexOf( "impact" );
      // eslint-disable-next-line no-restricted-syntax
      for ( const stepId of stepIds.slice( 0, impactIndex ) ) {
        // eslint-disable-next-line no-await-in-loop
        await continueFrom( stepId );
      }
      expect( await screen.findByTestId( "Onboarding.impact" ) ).toBeVisible( );

      const obsStoryIndex = stepIds.indexOf( "obs_story" );
      for ( let i = impactIndex; i > obsStoryIndex; i -= 1 ) {
        expect( container.current.getCurrentOptions( ).gestureEnabled ).not.toBe( false );
        // Stands in for the back gesture and Android back button, which both
        // pop the step stack and can't be performed in jest
        act( ( ) => container.current.goBack( ) );
        expect( screen.queryByTestId( `Onboarding.${stepIds[i]}` ) ).toBeNull( );
        expect( screen.getByTestId( `Onboarding.${stepIds[i - 1]}` ) ).toBeVisible( );
      }
    },
  );
} );
