import { useRoute } from "@react-navigation/native";
import classnames from "classnames";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { ScrollView, View } from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import { OnboardingCompactContext } from "./onboardingCompact";
import OnboardingProgressBar from "./OnboardingProgressBar";
import { getStepProgress, isOnboardingStepId } from "./onboardingSteps";
import useCompactWhenOverflowing from "./useCompactWhenOverflowing";
import useOnboardingExitSheet from "./useOnboardingExitSheet";

interface Props extends PropsWithChildren {
  // Usually the step's primary button, pinned below the scrolling content
  footer?: ReactNode;
  // Switch the step to its compact layout (see useOnboardingCompact) when its
  // content is too tall for the screen
  fitsToScreen?: boolean;
}

// Frame shared by the onboarding steps other than sign-up; shows the progress bar only on steps
// whose showsProgress is set, and a close button only on steps with an exit
// sheet
const OnboardingStepLayout = ( { children, footer, fitsToScreen = false }: Props ) => {
  const { t } = useTranslation( );
  const insets = useSafeAreaInsets( );
  const { name } = useRoute( );
  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `OnboardingStepLayout used outside an onboarding step: ${name}` );
  }
  const progress = getStepProgress( name );
  const { exitSheet, exitSheetElement, openExitSheet } = useOnboardingExitSheet( name );

  const { compact, onLayout, onContentSizeChange } = useCompactWhenOverflowing( fitsToScreen );

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
        // On steps that fit to the screen, the content stretches to the screen's
        // height so OnboardingFlexGaps can fill it, and the bottom padding
        // leaves room for the last card's shadow so the shadow counts toward
        // fitting
        contentContainerClassName={classnames( "px-[22px]", { "grow pb-2": fitsToScreen } )}
        alwaysBounceVertical={false}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
      >
        <OnboardingCompactContext.Provider value={compact}>
          {children}
        </OnboardingCompactContext.Provider>
      </ScrollView>
      {footer && (
        <View className="px-[15px] pt-[10px]">
          <OnboardingCompactContext.Provider value={compact}>
            {footer}
          </OnboardingCompactContext.Provider>
        </View>
      )}
      {exitSheetElement}
    </ScreenShell>
  );
};

export default OnboardingStepLayout;
