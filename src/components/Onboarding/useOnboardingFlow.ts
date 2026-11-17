import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OnboardingStackParamList } from "navigation/types";
import { useOnboardingShown } from "sharedHelpers/installData";

import type { OnboardingStepId } from "./onboardingSteps";
import { getNextStepId, isOnboardingStepId } from "./onboardingSteps";

const useOnboardingFlow = ( ) => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>( );
  const { name } = useRoute( );
  const [, setOnboardingShown] = useOnboardingShown( );

  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `useOnboardingFlow used outside an onboarding step: ${name}` );
  }
  const stepId: OnboardingStepId = name;

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

  return {
    proceedToNext,
    stepId,
  };
};

export default useOnboardingFlow;
