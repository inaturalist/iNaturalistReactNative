import { useRoute } from "@react-navigation/native";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { ScrollView, View } from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import OnboardingProgressBar from "./OnboardingProgressBar";
import { getStepProgress, isOnboardingStepId } from "./onboardingSteps";
import useOnboardingExitSheet from "./useOnboardingExitSheet";

interface Props extends PropsWithChildren {
  // Usually the step's primary button, pinned below the scrolling content
  footer?: ReactNode;
}

// Frame shared by the onboarding steps other than sign-up; shows the progress bar only on steps
// whose showsProgress is set, and a close button only on steps with an exit
// sheet
const OnboardingStepLayout = ( { children, footer }: Props ) => {
  const { t } = useTranslation( );
  const insets = useSafeAreaInsets( );
  const { name } = useRoute( );
  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `OnboardingStepLayout used outside an onboarding step: ${name}` );
  }
  const progress = getStepProgress( name );
  const { exitSheet, exitSheetElement, openExitSheet } = useOnboardingExitSheet( name );

  return (
    <ScreenShell
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      testID={`Onboarding.${name}`}
    >
      {progress !== null && <OnboardingProgressBar progress={progress} />}
      {exitSheet && (
        <View className="flex-row justify-end px-[8px]">
          <INatIconButton
            icon="close"
            size={19}
            color={colors.darkGray}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Asks-whether-to-exit" )}
            onPress={openExitSheet}
            testID={`Onboarding.${name}.close`}
          />
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-[22px]"
        alwaysBounceVertical={false}
      >
        {children}
      </ScrollView>
      {footer && (
        <View className="px-[15px] pt-[10px]">
          {footer}
        </View>
      )}
      {exitSheetElement}
    </ScreenShell>
  );
};

export default OnboardingStepLayout;
