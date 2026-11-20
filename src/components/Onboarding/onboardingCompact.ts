import { createContext, useContext } from "react";

// Provided by OnboardingStepLayout to steps that pass fitsToScreen
export const OnboardingCompactContext = createContext( false );

// True when the step's content is too tall for the screen, so the step should
// use its tighter compact layout
export const useOnboardingCompact = ( ) => useContext( OnboardingCompactContext );
