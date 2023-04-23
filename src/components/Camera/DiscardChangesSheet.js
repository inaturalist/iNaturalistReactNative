// @flow

import { useNavigation } from "@react-navigation/native";
import {
  WarningSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowDiscardSheet: Function
}

const DiscardChangesSheet = ( {
  setShowDiscardSheet
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  return (
    <WarningSheet
      handleClose={( ) => setShowDiscardSheet( false )}
      snapPoints={[180]}
      headerText={t( "DISCARD-PHOTOS" )}
      text={t( "By-exiting-your-photos-will-not-be-saved" )}
      secondButtonText={t( "CANCEL" )}
      handleSecondButtonPress={( ) => setShowDiscardSheet( false )}
      buttonText={t( "DISCARD" )}
      confirm={( ) => {
        setShowDiscardSheet( false );
        navigation.goBack( );
      }}
    />
  );
};

export default DiscardChangesSheet;
