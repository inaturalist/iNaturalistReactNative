// @flow

import { useNavigation } from "@react-navigation/native";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet.tsx";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  setShowLoginSheet: Function,
}

const LoginSheet = ( { setShowLoginSheet }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  return (
    <WarningSheet
      handleClose={( ) => setShowLoginSheet( false )}
      buttonType="focus"
      headerText={t( "PLEASE-LOG-IN" )}
      text={t( "To-sync-your-observations-to-iNaturalist" )}
      buttonText={t( "LOG-IN-TO-INATURALIST" )}
      confirm={( ) => {
        setShowLoginSheet( false );
        navigation.navigate( "LoginStackNavigator" );
      }}
    />
  );
};

export default LoginSheet;
