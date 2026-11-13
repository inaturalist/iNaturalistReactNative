export type OnboardingExitSheet = "demo" | "signup";

interface OnboardingStepConfig {
  id: string;
  showsProgress: boolean;
  blocksBack: boolean;
  // The exit sheet the step's close button opens; steps without one have no
  // close button
  exitSheet?: OnboardingExitSheet;
}

// The first-run onboarding flow, in order. Each id is the step's analytics
// screen_id and its route name. Kept free of component imports so step
// screens can import it without a cycle. blocksBack disables both the iOS
// swipe-back gesture and the Android hardware back button.
export const ONBOARDING_STEPS = [
  {
    id: "welcome",
    showsProgress: false,
    blocksBack: false,
  },
  {
    id: "obs_story",
    showsProgress: true,
    exitSheet: "demo",
    blocksBack: false,
  },
  {
    id: "community_id",
    showsProgress: true,
    exitSheet: "demo",
    blocksBack: false,
  },
  {
    id: "research_grade",
    showsProgress: true,
    exitSheet: "demo",
    blocksBack: false,
  },
  {
    id: "impact",
    showsProgress: true,
    exitSheet: "demo",
    blocksBack: false,
  },
  {
    id: "signup_email",
    showsProgress: false,
    exitSheet: "signup",
    blocksBack: false,
  },
  {
    id: "signup_credentials",
    showsProgress: false,
    exitSheet: "signup",
    blocksBack: false,
  },
  {
    id: "location_explainer",
    showsProgress: true,
    blocksBack: true,
  },
] as const satisfies readonly OnboardingStepConfig[];

export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export type OnboardingStepId = OnboardingStep["id"];

const ONBOARDING_STEP_IDS: readonly string[] = ONBOARDING_STEPS.map( step => step.id );

// The step each exit sheet leads to once the user confirms it
export const EXIT_SHEET_DESTINATIONS = {
  demo: "signup_email",
  signup: "location_explainer",
} as const satisfies Record<OnboardingExitSheet, OnboardingStepId>;

export const isOnboardingStepId = ( name: string ): name is OnboardingStepId => (
  ONBOARDING_STEP_IDS.includes( name )
);

const stepIndex = ( id: OnboardingStepId ) => (
  ONBOARDING_STEPS.findIndex( step => step.id === id )
);

export const getExitSheet = ( id: OnboardingStepId ): OnboardingExitSheet | null => {
  const step: OnboardingStepConfig = ONBOARDING_STEPS[stepIndex( id )];
  return step.exitSheet ?? null;
};

export const getNextStepId = ( id: OnboardingStepId ): OnboardingStepId | null => (
  ONBOARDING_STEPS[stepIndex( id ) + 1]?.id ?? null
);

export const getStepBlocksBack = ( id: OnboardingStepId ): boolean => (
  ONBOARDING_STEPS[stepIndex( id )].blocksBack
);

// Fraction of the flow completed on arriving at this step
export const getStepProgress = ( id: OnboardingStepId ): number | null => {
  const index = stepIndex( id );
  if ( !ONBOARDING_STEPS[index].showsProgress ) return null;
  return index / ONBOARDING_STEPS.length;
};
