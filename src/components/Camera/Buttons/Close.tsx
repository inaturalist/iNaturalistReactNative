import { useNavigation } from "@react-navigation/native";
import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

const Close = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <TransparentCircleButton
      onPress={( ) => navigation.goBack( )}
      accessibilityLabel={t( "Close" )}
      accessibilityHint={t( "Navigates-to-previous-screen" )}
      icon="close"
    />
  );
};

export default Close;
