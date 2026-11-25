// Drop shadow for the sample cards on the onboarding education steps.
// Android draws `elevation` from the view's outline, so the view needs a
// background color for the shadow to show.
const CARD_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 4,
} as const;

export default CARD_SHADOW;
