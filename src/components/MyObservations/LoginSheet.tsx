import { useNavigation } from "@react-navigation/native";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import React from "react";
import { useTranslation } from "sharedHooks";

import { ACTIVE_SHEET } from "./MyObservationsContainer";

interface Props {
  setShowLoginSheet: ( value: ACTIVE_SHEET ) => void;
}

const LoginSheet = ( { setShowLoginSheet }: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  return (
    <WarningSheet
      onPressClose={( ) => setShowLoginSheet( ACTIVE_SHEET.NONE )}
      buttonType="focus"
      headerText={t( "PLEASE-LOG-IN" )}
      text={t( "To-sync-your-observations-to-iNaturalist" )}
      buttonText={t( "LOG-IN-TO-INATURALIST" )}
      confirm={( ) => {
        setShowLoginSheet( ACTIVE_SHEET.NONE );
        navigation.navigate( "LoginStackNavigator" );
      }}
    />
  );
};

export default LoginSheet;
