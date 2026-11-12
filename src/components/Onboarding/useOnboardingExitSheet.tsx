import { useFocusEffect } from "@react-navigation/native";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import type { TFunction } from "i18next";
import React, { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import useTranslation from "sharedHooks/useTranslation";

import type { OnboardingExitSheet } from "./onboardingSteps";
import useOnboardingFlow from "./useOnboardingFlow";

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

// The current step's exit sheet, for any step layout: exitSheet is null on
// steps without one, which show no close button. Render exitSheetElement
// last so the sheet sits above the step.
const useOnboardingExitSheet = ( ) => {
  const { t } = useTranslation( );
  const { stepId, exitSheet, exit } = useOnboardingFlow( );
  const [exitSheetOpen, setExitSheetOpen] = useState( false );

  const openExitSheet = useCallback( ( ) => setExitSheetOpen( true ), [] );
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

  let exitSheetElement = null;
  if ( exitSheet && exitSheetOpen ) {
    const copy = getExitSheetCopy( exitSheet, t );
    exitSheetElement = (
      <WarningSheet
        headerText={copy.headerText}
        text={copy.text}
        buttonText={copy.buttonText}
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
    );
  }

  return {
    exitSheet,
    exitSheetElement,
    openExitSheet,
  };
};

export default useOnboardingExitSheet;
