import INatIcon from "components/SharedComponents/INatIcon";
import Body2 from "components/SharedComponents/Typography/Body2";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import colors from "styles/tailwindColors";

// A green checkmark beside a line of text, for the checklists on onboarding
// steps. Children render inside Body2, so they can include nested styled Text
// such as bold spans from <Trans>
const OnboardingChecklistItem = ( { children }: PropsWithChildren ) => (
  <View className="flex-row items-start">
    <View accessibilityElementsHidden importantForAccessibility="no">
      <INatIcon name="checkmark-circle" size={19} color={colors.inatGreen} />
    </View>
    <Body2 className="ml-3 flex-1">{children}</Body2>
  </View>
);

export default OnboardingChecklistItem;
