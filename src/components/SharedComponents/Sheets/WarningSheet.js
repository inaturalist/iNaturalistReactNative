// @flow

import {
  BottomSheet, BottomSheetStandardBackdrop, Button,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  handleClose: Function,
  headerText: string,
  text?: string,
  buttonText: string,
  confirm: Function,
  snapPoints: Array<number>,
  secondButtonText?: string,
  handleSecondButtonPress?: Function
}

const WarningSheet = ( {
  handleClose,
  headerText,
  text,
  buttonText,
  confirm,
  snapPoints,
  secondButtonText,
  handleSecondButtonPress
}: Props ): Node => {
  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
      handleClose={handleClose}
      headerText={headerText}
      snapPoints={snapPoints}
      onChange={position => {
        if ( position === -1 ) {
          handleClose( );
        }
      }}
    >
      <View className="items-center p-5">
        {text && <List2 className="mb-6">{text}</List2>}
        <View className="flex-row">
          {secondButtonText && (
            <Button
              onPress={handleSecondButtonPress}
              text={secondButtonText}
            />
          ) }
          <Button
            onPress={confirm}
            text={buttonText}
            level="warning"
            className="grow ml-3"
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default WarningSheet;
