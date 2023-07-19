// @flow

import { useNavigation } from "@react-navigation/native";
import TransparentCircleButton from "components/SharedComponents/Buttons/TransparentCircleButton";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

const Close = ( ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <TransparentCircleButton
      onPress={( ) => navigation.goBack( )}
      accessibilityLabel={t( "Close-AR-camera" )}
      icon="close"
    />
  );
};

export default Close;
