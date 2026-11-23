import { useNavigation } from "@react-navigation/native";
import ConfirmSheet from "components/SharedComponents/Sheets/ConfirmSheet";
import type { TFunction } from "i18next";
import type { OnboardingStackScreenProps } from "navigation/types";
import React, { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

import type { OnboardingExitSheet, OnboardingStepId } from "./onboardingSteps";
import { EXIT_SHEET_DESTINATIONS, getExitSheet } from "./onboardingSteps";

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

// The step's exit sheet, for any step layout: exitSheet is null on steps
// without one, which show no close button. Render exitSheetElement last so the
// sheet sits above the step.
const useOnboardingExitSheet = ( stepId: OnboardingStepId ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation<OnboardingStackScreenProps<OnboardingStepId>["navigation"]>( );
  const [exitSheetOpen, setExitSheetOpen] = useState( false );
  const exitSheet = getExitSheet( stepId );

  const openExitSheet = useCallback( ( ) => {
    Keyboard.dismiss( );
    setExitSheetOpen( true );
  }, [] );
  const closeExitSheet = ( ) => setExitSheetOpen( false );

  let exitSheetElement = null;
  if ( exitSheet && exitSheetOpen ) {
    const copy = getExitSheetCopy( exitSheet, t );
    exitSheetElement = (
      <ConfirmSheet
        headerText={copy.headerText}
        text={copy.text}
        confirmText={copy.buttonText}
        cancelText={t( "CANCEL" )}
        onCancel={closeExitSheet}
        onConfirm={( ) => {
          closeExitSheet( );
          navigation.navigate( EXIT_SHEET_DESTINATIONS[exitSheet] );
        }}
        testID={`Onboarding.${stepId}.exitSheet`}
      />
    );
  }

  return {
    exitSheet,
    exitSheetElement,
    openExitSheet,
  };
};

export default useOnboardingExitSheet;
