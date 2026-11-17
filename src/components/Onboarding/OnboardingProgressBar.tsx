import { View } from "components/styledComponents";
import React from "react";

interface Props {
  // Fraction complete, from 0 to 1
  progress: number;
}

const OnboardingProgressBar = ( { progress }: Props ) => (
  <View
    className="h-[5px] w-full"
    accessible
    accessibilityRole="progressbar"
    accessibilityValue={{ min: 0, max: 100, now: Math.round( progress * 100 ) }}
    testID="Onboarding.progress"
  >
    <View
      className="h-full rounded-r-full bg-inatGreen"
      style={{ width: `${progress * 100}%` }}
    />
  </View>
);

export default OnboardingProgressBar;
