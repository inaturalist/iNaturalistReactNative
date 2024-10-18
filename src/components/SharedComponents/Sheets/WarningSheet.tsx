import {
  BottomSheet,
  Button,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  buttonText: string;
  buttonType?: string;
  confirm: () => void;
  handleSecondButtonPress?: () => void;
  headerText: string;
  hidden?: boolean;
  insideModal?: boolean;
  onPressClose: () => void;
  secondButtonText?: string;
  testID?: string;
  text?: string;
}

const WarningSheet = ( {
  buttonText,
  buttonType,
  confirm,
  handleSecondButtonPress,
  headerText,
  hidden,
  insideModal,
  onPressClose,
  secondButtonText,
  testID,
  text
}: Props ) => (
  <BottomSheet
    onPressClose={onPressClose}
    headerText={headerText}
    hidden={hidden}
    insideModal={insideModal}
  >
    <View className="items-center p-5" testID={testID}>
      {text && <List2 className="mb-6">{text}</List2>}
      <View className="flex-row">
        {secondButtonText && handleSecondButtonPress && (
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
