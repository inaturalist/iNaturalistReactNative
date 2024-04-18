// @flow

import { useNavigation } from "@react-navigation/native";
import { Button } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  keysToUpdate: object,
  goBackOnSave: boolean,
  updateObservationKeys: ( ) => void
};

const Footer = ( { keysToUpdate, goBackOnSave, updateObservationKeys }: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  return (
    <View className="h-[73px] justify-center">
      <Button
        className="mx-[25px]"
        onPress={( ) => {
          updateObservationKeys( keysToUpdate );
          if ( goBackOnSave ) {
            navigation.goBack( );
          }
        }}
        testID="LocationPicker.saveButton"
        text={t( "SAVE-LOCATION" )}
        level="neutral"
      />
    </View>
  );
};

export default Footer;
