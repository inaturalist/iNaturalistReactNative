import { useFocusEffect } from "@react-navigation/native";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { ScrollView, View } from "components/styledComponents";
import type { TFunction } from "i18next";
import type { PropsWithChildren, ReactNode } from "react";
import React, { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import OnboardingProgressBar from "./OnboardingProgressBar";
import type { OnboardingExitSheet } from "./onboardingSteps";
import { getStepProgress } from "./onboardingSteps";
import useOnboardingFlow from "./useOnboardingFlow";

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
  const { stepId, exitSheet, exit } = useOnboardingFlow( );
  const [exitSheetOpen, setExitSheetOpen] = useState( false );
  const progress = getStepProgress( stepId );
  const exitSheetCopy = exitSheet
    ? getExitSheetCopy( exitSheet, t )
    : null;

  const closeExitSheet = useCallback( ( ) => setExitSheetOpen( false ), [] );

  useFocusEffect(
    useCallback( ( ) => {
      const backHandler = BackHandler.addEventListener( "hardwareBackPress", ( ) => {
        if ( !exitSheetOpen ) return false;
        closeExitSheet( );
        return true;
      } );
      return ( ) => backHandler.remove( );
    }, [exitSheetOpen, closeExitSheet] ),
  );

  return (
    <ScreenShell
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      testID={`Onboarding.${stepId}`}
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
            testID={`Onboarding.${stepId}.close`}
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
        <WarningSheet
          headerText={exitSheetCopy.headerText}
          text={exitSheetCopy.text}
          buttonText={exitSheetCopy.buttonText}
          secondButtonText={t( "CANCEL" )}
          handleSecondButtonPress={closeExitSheet}
          onPressClose={closeExitSheet}
          confirm={( ) => {
            closeExitSheet( );
            exit( exitSheet );
          }}
          loading={false}
          testID={`Onboarding.${stepId}.exitSheet`}
        />
      )}
    </ScreenShell>
  );
};

export default OnboardingStepLayout;
