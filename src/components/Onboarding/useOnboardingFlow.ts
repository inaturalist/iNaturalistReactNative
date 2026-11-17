import {
  CommonActions, useFocusEffect, useNavigation, useRoute,
} from "@react-navigation/native";
import type { OnboardingStackScreenProps, OnboardingStepParamList } from "navigation/types";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useOnboardingShown } from "sharedHelpers/installData";

import { showLocationStep } from "./onboardingNavigation";
import type { OnboardingStepId } from "./onboardingSteps";
import { getNextStepId, getStepBlocksBack, isOnboardingStepId } from "./onboardingSteps";

// What a step hands to the next one; only the sign-up email step passes anything
type NextStepParams = OnboardingStepParamList["signup_credentials"];

const useOnboardingFlow = ( ) => {
  const navigation = useNavigation<OnboardingStackScreenProps<OnboardingStepId>["navigation"]>( );
  const { name } = useRoute( );
  const [, setOnboardingShown] = useOnboardingShown( );

  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `useOnboardingFlow used outside an onboarding step: ${name}` );
  }
  const stepId: OnboardingStepId = name;
  const blocksBack = getStepBlocksBack( stepId );

  useFocusEffect(
    useCallback( ( ) => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        ( ) => blocksBack,
      );
      return ( ) => backHandler.remove( );
    }, [blocksBack] ),
  );

  const finishOnboarding = ( ) => {
    // Name the destination explicitly rather than relying on
    // RootStackNavigator falling back to its first registered screen once
    // onboardingShown unregisters the onboarding stack
    navigation.getParent( )?.dispatch(
      CommonActions.reset( {
        index: 0,
        routes: [{ name: "TabNavigator" }],
      } ),
    );
    setOnboardingShown( true );
  };

  const proceedToNext = ( params?: NextStepParams ) => {
    const nextStepId = getNextStepId( stepId );
    if ( !nextStepId ) {
      finishOnboarding( );
    } else if ( nextStepId === "signup_credentials" ) {
      if ( !params ) {
        throw new Error( `${stepId} must pass the email to signup_credentials` );
      }
      navigation.navigate( nextStepId, params );
    } else {
      navigation.navigate( nextStepId );
    }
  };

  // Opens Login on top of the step, so closing Login goes back to it
  const logIn = ( ) => {
    navigation.navigate( "LoginStackNavigator", {
      screen: "Login",
      params: { fromOnboarding: true },
    } );
  };

  // Signed in from a step (e.g. with Apple or Google), so skip ahead to the
  // location permission step
  const signedIn = ( ) => showLocationStep( navigation );

  return {
    logIn,
    proceedToNext,
    signedIn,
    stepId,
  };
};

export default useOnboardingFlow;
