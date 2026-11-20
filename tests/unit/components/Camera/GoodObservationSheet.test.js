import {
  act, fireEvent, render, screen,
} from "@testing-library/react-native";
import GoodObservationSheet, {
  GOOD_OBSERVATION_SHEET_KEY,
} from "components/Camera/AICamera/GoodObservationSheet";
import i18next from "i18next";
import React from "react";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

const setOnboardingFlag = enabled => act( ( ) => {
  useStore.getState( ).setFeatureFlagApiValues(
    { [FeatureFlag.OnboardingV2Enabled]: enabled },
    true,
  );
} );

const resetShownOnce = ( ) => act( ( ) => {
  useStore.getState( ).layout.resetShownOnce( );
} );

describe( "GoodObservationSheet", ( ) => {
  beforeEach( ( ) => {
    resetShownOnce( );
    setOnboardingFlag( true );
  } );

  afterEach( ( ) => {
    resetShownOnce( );
    setOnboardingFlag( false );
  } );

  it( "shows the first time while the onboarding flag is on", ( ) => {
    render( <GoodObservationSheet /> );

    expect( screen.getByTestId( "GoodObservationSheet" ) ).toBeVisible( );
  } );

  it( "does not show while the onboarding flag is off", ( ) => {
    setOnboardingFlag( false );
    render( <GoodObservationSheet /> );

    expect( screen.queryByTestId( "GoodObservationSheet" ) ).not.toBeOnTheScreen( );
  } );

  it( "is marked shown on close and does not come back", ( ) => {
    const { unmount } = render( <GoodObservationSheet /> );

    fireEvent.press( screen.getByLabelText( i18next.t( "Close" ) ) );

    expect( useStore.getState( ).layout.shownOnce[GOOD_OBSERVATION_SHEET_KEY] ).toBe( true );
    expect( screen.queryByTestId( "GoodObservationSheet" ) ).not.toBeOnTheScreen( );

    unmount( );
    render( <GoodObservationSheet /> );
    expect( screen.queryByTestId( "GoodObservationSheet" ) ).not.toBeOnTheScreen( );
  } );

  it( "shows again once the shown state is unset", ( ) => {
    act( ( ) => useStore.getState( ).layout.setShownOnce( GOOD_OBSERVATION_SHEET_KEY ) );
    render( <GoodObservationSheet /> );
    expect( screen.queryByTestId( "GoodObservationSheet" ) ).not.toBeOnTheScreen( );

    act( ( ) => useStore.getState( ).layout.unsetShownOnce( GOOD_OBSERVATION_SHEET_KEY ) );

    expect( screen.getByTestId( "GoodObservationSheet" ) ).toBeVisible( );
  } );
} );
