import { createContext, useContext } from "react";

import type { OnboardingStepId } from "./onboardingSteps";

// Supplied by each navigator that hosts onboarding steps: which steps it runs,
// in order, and where they go when the user finishes
export interface OnboardingFlowHost {
  steps: readonly OnboardingStepId[];
  onFinish: ( ) => void;
}

const OnboardingFlowContext = createContext<OnboardingFlowHost | null>( null );

export const OnboardingFlowProvider = OnboardingFlowContext.Provider;

export const useOnboardingFlowHost = ( ): OnboardingFlowHost => {
  const host = useContext( OnboardingFlowContext );
  if ( !host ) {
    throw new Error( "Onboarding steps must be rendered inside an OnboardingFlowProvider" );
  }
  return host;
};
