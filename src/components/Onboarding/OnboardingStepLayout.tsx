import { useNavigation, useRoute } from "@react-navigation/native";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import ConfirmSheet from "components/SharedComponents/Sheets/ConfirmSheet";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { ScrollView, View } from "components/styledComponents";
import type { TFunction } from "i18next";
import type { OnboardingStackScreenProps } from "navigation/types";
import type { PropsWithChildren, ReactNode } from "react";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import OnboardingProgressBar from "./OnboardingProgressBar";
import type { OnboardingExitSheet, OnboardingStepId } from "./onboardingSteps";
import {
  EXIT_SHEET_DESTINATIONS, getExitSheet, getStepProgress, isOnboardingStepId,
} from "./onboardingSteps";

interface Props extends PropsWithChildren {
  // Usually the step's primary button, pinned below the scrolling content
  footer?: ReactNode;
}

const getExitSheetCopy = ( sheet: OnboardingExitSheet, t: TFunction ) => (
  sheet === "demo"
    ? {
      headerText: t( "Would-you-like-to-exit-the-demo" ),
      text: t( "You-can-always-revisit-this-later-in-settings" ),
      buttonText: t( "YES-EXIT" ),
    }
    : {
      headerText: t( "Exit-signup--question" ),
      text: t( "You-can-only-get-identifications-from-other-people-by-creating-an-account" ),
      buttonText: t( "EXIT" ),
    }
);

// Frame shared by every onboarding step; shows the progress bar only on steps
// whose showsProgress is set, and a close button only on steps with an exit
// sheet
const OnboardingStepLayout = ( { children, footer }: Props ) => {
  const { t } = useTranslation( );
  const insets = useSafeAreaInsets( );
  const navigation = useNavigation<OnboardingStackScreenProps<OnboardingStepId>["navigation"]>( );
  const { name } = useRoute( );
  const [exitSheetOpen, setExitSheetOpen] = useState( false );
  if ( !isOnboardingStepId( name ) ) {
    throw new Error( `OnboardingStepLayout used outside an onboarding step: ${name}` );
  }
  const progress = getStepProgress( name );
  const exitSheet = getExitSheet( name );
  const exitSheetCopy = exitSheet
    ? getExitSheetCopy( exitSheet, t )
    : null;

  const closeExitSheet = ( ) => setExitSheetOpen( false );

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
            onPress={( ) => setExitSheetOpen( true )}
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
      {exitSheet && exitSheetCopy && exitSheetOpen && (
        <ConfirmSheet
          headerText={exitSheetCopy.headerText}
          text={exitSheetCopy.text}
          confirmText={exitSheetCopy.buttonText}
          cancelText={t( "CANCEL" )}
          onCancel={closeExitSheet}
          onConfirm={( ) => {
            closeExitSheet( );
            navigation.navigate( EXIT_SHEET_DESTINATIONS[exitSheet] );
          }}
          testID={`Onboarding.${name}.exitSheet`}
        />
      )}
    </ScreenShell>
  );
};

export default OnboardingStepLayout;
