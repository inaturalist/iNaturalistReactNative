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
  updateGeoprivacyStatus: Function
}

const GeoprivacySheet = ( {
  handleClose,
  updateGeoprivacyStatus
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checkBoxValue, setCheckBoxValue] = useState( "none" );

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={t( "GEOPRIVACY" )}
      snapPoints={[406]}
    >
      <View className="p-6">
        <View className="flex-row mb-4">
          <CheckBox
            disabled={false}
            value={checkBoxValue === "open"}
            onValueChange={( ) => setCheckBoxValue( "open" )}
          />
          <View className="ml-3 flex-1">
            <Body1>{t( "Open" )}</Body1>
            <List2 className="flex-wrap">{t( "Anyone-using-iNaturalist-can-see" )}</List2>
          </View>
        </View>
        <View className="flex-row mb-4">
          <CheckBox
            disabled={false}
            value={checkBoxValue === "obscured"}
            onValueChange={( ) => setCheckBoxValue( "obscured" )}
          />
          <View className="ml-3 flex-1">
            <Body1>{t( "Obscured" )}</Body1>
            <List2 className="flex-wrap">{t( "The-exact-location-will-be-hidden" )}</List2>
          </View>
        </View>
        <View className="flex-row mb-4">
          <CheckBox
            disabled={false}
            value={checkBoxValue === "private"}
            onValueChange={( ) => setCheckBoxValue( "private" )}
          />
          <View className="ml-3 flex-1">
            <Body1>{t( "Private" )}</Body1>
            <List2 className="flex-wrap">{t( "The-location-will-not-be-visible" )}</List2>
          </View>
        </View>
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={( ) => {
            updateGeoprivacyStatus( checkBoxValue );
            handleClose( );
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default GeoprivacySheet;
