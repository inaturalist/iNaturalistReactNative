import { useRoute } from "@react-navigation/native";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { ScrollView, View } from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingProgressBar from "./OnboardingProgressBar";
import { getStepProgress, isOnboardingStepId } from "./onboardingSteps";

interface Props extends PropsWithChildren {
  // Usually the step's primary button, pinned below the scrolling content
  footer?: ReactNode;
}

// Frame shared by every onboarding step; shows the progress bar only on steps
// whose showsProgress is set
const OnboardingStepLayout = ( { children, footer }: Props ) => {
  const { name } = useRoute( );
  const insets = useSafeAreaInsets( );
  const progress = isOnboardingStepId( name )
    ? getStepProgress( name )
    : null;

  return (
    <ScreenShell
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      testID={`Onboarding.${name}`}
    >
      {progress !== null && <OnboardingProgressBar progress={progress} />}
      <ScrollView className="flex-1" contentContainerClassName="px-[22px] pb-[20px]">
        {children}
      </ScrollView>
      {footer && (
        <View className="px-[15px] pt-[10px] pb-[20px]">
          {footer}
        </View>
      )}
    </ScreenShell>
  );
};

export default OnboardingStepLayout;
