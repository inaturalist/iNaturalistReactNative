// @flow
import {
  BottomSheet,
  ButtonBar,
  DisplayTaxon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

type Props = {
  onPressClose: Function,
  updateIdentification: Function,
  taxon: Object
};

const showTaxon = taxon => {
  if ( !taxon ) {
    return <Text>{t( "Unknown-organism" )}</Text>;
  }
  return (
    <View className="flex-row mx-[15px]">
      <DisplayTaxon taxon={taxon} />
    </View>
  );
};

const WithdrawIDSheet = ( {
  onPressClose,
  updateIdentification,
  taxon
}: Props ): Node => {
  const buttons = [
    {
      text: t( "CANCEL" ),
      onPress: ( ) => {
        onPressClose();
      },
      className: "mx-2",
      testID: "ObsDetail.WithdrawId.cancel",
      accessibilityRole: "button",
      accessibilityHint: t( "Closes-withdraw-id-sheet" ),
      level: "secondary"
    },
    {
      text: t( "WITHDRAW-ID" ),
      onPress: ( ) => {
        updateIdentification( { current: false } );
        onPressClose();
      },
      className: "mx-2 grow",
      testID: "ObsDetail.WithdrawId.withdraw",
      accessibilityRole: "button",
      accessibilityHint: t( "Withdraws-identification" ),
      level: "primary"
    }
  ];
  return (
    <BottomSheet
      onPressClose={onPressClose}
      headerText={t( "WITHDRAW-ID-QUESTION" )}
    >
      <View
        className="mx-[26px] space-y-[11px] my-[15px]"
      >
        {showTaxon( taxon )}
        <ButtonBar buttonConfiguration={buttons} containerClass="pt-[15px]" />
      </View>
    </BottomSheet>
  );
};

export default WithdrawIDSheet;
