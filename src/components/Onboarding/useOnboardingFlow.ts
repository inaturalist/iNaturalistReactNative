import {
  CommonActions, useFocusEffect, useNavigation, useRoute,
} from "@react-navigation/native";
import type { OnboardingStackScreenProps } from "navigation/types";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useOnboardingShown } from "sharedHelpers/installData";

import { showLocationStep } from "./onboardingNavigation";
import type { OnboardingStepId } from "./onboardingSteps";
import { getNextStepId, getStepBlocksBack, isOnboardingStepId } from "./onboardingSteps";

const useOnboardingFlow = ( ) => {
  const navigation = useNavigation<OnboardingStackScreenProps<OnboardingStepId>["navigation"]>( );
  const { name } = useRoute( );
  const [, setOnboardingShown] = useOnboardingShown( );

  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `useOnboardingFlow used outside an onboarding step: ${name}` );
  }
  const stepId: OnboardingStepId = name;
  const blocksBack = getStepBlocksBack( stepId );

  // A step that blocks back still lets back close the app when it's the
  // first screen
  useFocusEffect(
    useCallback( ( ) => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        ( ) => blocksBack && navigation.canGoBack( ),
      );
      return ( ) => backHandler.remove( );
    }, [blocksBack, navigation] ),
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

  const proceedToNext = ( ) => {
    const nextStepId = getNextStepId( stepId );
    if ( !nextStepId ) {
      finishOnboarding( );
    } else if ( nextStepId === "signup_credentials" ) {
      throw new Error( `${stepId} must navigate to signup_credentials itself, with the email` );
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

  // Opens the sign-up Learn More screen on top of the step
  const learnMore = ( ) => {
    navigation.navigate( "LoginStackNavigator", { screen: "LearnMore" } );
  };

  return {
    learnMore,
    logIn,
    proceedToNext,
    signedIn,
    stepId,
  };
};

export default useOnboardingFlow;
