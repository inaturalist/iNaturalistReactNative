// @flow

import {
  BottomSheet, Button, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  handleClose: ( ) => void,
  headerText: string,
  text?: string,
  buttonText: string,
  confirm: ( ) => void,
  secondButtonText?: string,
  handleSecondButtonPress?: ( ) => void,
  buttonType?: string,
  hidden?: boolean,
  insideModal?: boolean
}

const WarningSheet = ( {
  handleClose,
  headerText,
  text,
  buttonText,
  confirm,
  secondButtonText,
  handleSecondButtonPress,
  buttonType,
  hidden,
  insideModal
}: Props ): Node => (
  <BottomSheet
    handleClose={handleClose}
    headerText={headerText}
    hidden={hidden}
    insideModal={insideModal}
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
          level={buttonType || "warning"}
          className="grow ml-3"
        />
      </View>
    </View>
  </BottomSheet>
);

export default WarningSheet;
