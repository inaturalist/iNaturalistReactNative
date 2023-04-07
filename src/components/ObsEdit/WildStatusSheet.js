// @flow

import CheckBox from "@react-native-community/checkbox";
import { Body1, Button, List2 } from "components/SharedComponents";
import BottomSheet from "components/SharedComponents/BottomSheet";
import BottomSheetStandardBackdrop from "components/SharedComponents/BottomSheetStandardBackdrop";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  updateCaptiveStatus: Function
}

const WildStatusSheet = ( {
  handleClose,
  updateCaptiveStatus
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checkBoxValue, setCheckBoxValue] = useState( "none" );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={t( "WILD-STATUS" )}
      snapPoints={[298]}
    >
      <View className="p-6">
        <View className="flex-row mb-4">
          <CheckBox
            disabled={false}
            value={checkBoxValue === false}
            onValueChange={( ) => setCheckBoxValue( false )}
          />
          <View className="ml-3 flex-1">
            <Body1>{t( "Wild" )}</Body1>
            <List2 className="flex-wrap">{t( "This-is-a-wild-organism" )}</List2>
          </View>
        </View>
        <View className="flex-row mb-4">
          <CheckBox
            disabled={false}
            value={checkBoxValue === true}
            onValueChange={( ) => setCheckBoxValue( true )}
          />
          <View className="ml-3 flex-1">
            <Body1>{t( "Captive-Cultivated" )}</Body1>
            <List2 className="flex-wrap">{t( "This-organism-was-placed-by-humans" )}</List2>
          </View>
        </View>
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={( ) => {
            updateCaptiveStatus( checkBoxValue );
            handleClose( );
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default WildStatusSheet;
