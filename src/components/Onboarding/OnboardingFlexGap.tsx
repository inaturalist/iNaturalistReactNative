import { View } from "components/styledComponents";
import React from "react";

interface Props {
  // The tightest the gap gets on a short screen
  min: number;
  // The design's size for the gap, reached when the screen has room
  max: number;
}

// A vertical gap between blocks on a step that fits to the screen. Gaps
// stretch from min toward max to fill the step's height, sharing the space in
// proportion to their ranges, so a slightly short screen only tightens the
// spacing a little and a tall one matches the design
const OnboardingFlexGap = ( { min, max }: Props ) => (
  <View style={{ minHeight: min, maxHeight: max, flexGrow: max - min }} />
);

export default OnboardingFlexGap;
