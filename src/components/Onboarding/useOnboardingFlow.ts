import {
  CommonActions, useFocusEffect, useNavigation, useRoute,
} from "@react-navigation/native";
import type { OnboardingStackScreenProps } from "navigation/types";
import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useOnboardingShown } from "sharedHelpers/installData";

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

  const proceedToNext = ( ) => {
    const nextStepId = getNextStepId( stepId );
    if ( nextStepId ) {
      navigation.navigate( nextStepId );
    } else {
      finishOnboarding( );
    }
  };

  // Opens Login on top of the step, so closing Login goes back to it
  const logIn = ( ) => {
    navigation.navigate( "LoginStackNavigator", {
      screen: "Login",
      params: { fromOnboarding: true },
    } );
  };

  return {
    logIn,
    proceedToNext,
    stepId,
  };
};

export default useOnboardingFlow;
