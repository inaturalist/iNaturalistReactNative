import { useNavigation } from "@react-navigation/native";
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet.tsx";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  setShowLoginSheet: ( show: boolean ) => void;
}

const LoginSheet = ( { setShowLoginSheet }: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  return (
    <WarningSheet
      onPressClose={( ) => setShowLoginSheet( false )}
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
