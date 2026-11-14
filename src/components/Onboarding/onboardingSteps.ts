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
    blocksBack: false,
  },
  {
    id: "community_id",
    showsProgress: true,
    blocksBack: false,
  },
  {
    id: "research_grade",
    showsProgress: true,
    blocksBack: false,
  },
  {
    id: "impact",
    showsProgress: true,
    blocksBack: false,
  },
  {
    id: "signup_email",
    showsProgress: false,
    blocksBack: false,
  },
  {
    id: "signup_credentials",
    showsProgress: false,
    blocksBack: false,
  },
  {
    id: "location_explainer",
    showsProgress: true,
    blocksBack: true,
  },
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export type OnboardingStepId = OnboardingStep["id"];

const ONBOARDING_STEP_IDS: readonly string[] = ONBOARDING_STEPS.map( step => step.id );

export const isOnboardingStepId = ( name: string ): name is OnboardingStepId => (
  ONBOARDING_STEP_IDS.includes( name )
);

const stepIndex = ( id: OnboardingStepId ) => (
  ONBOARDING_STEPS.findIndex( step => step.id === id )
);

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
