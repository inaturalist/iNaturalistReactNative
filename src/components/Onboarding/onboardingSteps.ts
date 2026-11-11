// The first-run onboarding flow, in order. Each id is the step's analytics
// screen_id and its route name. Kept free of component imports so step
// screens can import it without a cycle.
export const ONBOARDING_STEPS = [
  {
    id: "welcome",
    showsProgress: false,
  },
  {
    id: "obs_story",
    showsProgress: true,
  },
  {
    id: "community_id",
    showsProgress: true,
  },
  {
    id: "research_grade",
    showsProgress: true,
  },
  {
    id: "impact",
    showsProgress: true,
  },
  {
    id: "signup_email",
    showsProgress: false,
  },
  {
    id: "signup_credentials",
    showsProgress: false,
  },
  {
    id: "location_explainer",
    showsProgress: true,
  },
] as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[number];
export type OnboardingStepId = OnboardingStep["id"];

export const FIRST_RUN_STEP_IDS: readonly OnboardingStepId[] = ONBOARDING_STEPS.map(
  step => step.id,
);

const ONBOARDING_STEP_IDS: readonly string[] = FIRST_RUN_STEP_IDS;

export const isOnboardingStepId = ( name: string ): name is OnboardingStepId => (
  ONBOARDING_STEP_IDS.includes( name )
);

const stepIndex = ( id: OnboardingStepId ) => (
  ONBOARDING_STEPS.findIndex( step => step.id === id )
);

// The step after this one in the hosting flow's order, or null on its last step
export const getNextStepId = (
  steps: readonly OnboardingStepId[],
  id: OnboardingStepId,
): OnboardingStepId | null => {
  const index = steps.indexOf( id );
  if ( index === -1 ) {
    throw new Error( `Onboarding step ${id} isn't part of this flow` );
  }
  return steps[index + 1] ?? null;
};

// Fraction of the first-run flow completed on arriving at this step
export const getStepProgress = ( id: OnboardingStepId ): number | null => {
  const index = stepIndex( id );
  if ( !ONBOARDING_STEPS[index].showsProgress ) return null;
  return index / ONBOARDING_STEPS.length;
};
