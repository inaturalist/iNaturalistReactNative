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
  handleClose: () => void;
  handleSecondButtonPress?: () => void;
  headerText: string;
  hidden?: boolean;
  insideModal?: boolean;
  secondButtonText?: string;
  testID?: string;
  text?: string;
}

const WarningSheet = ( {
  buttonText,
  buttonType,
  confirm,
  handleClose,
  handleSecondButtonPress,
  headerText,
  hidden,
  insideModal,
  secondButtonText,
  testID,
  text
}: Props ) => (
  <BottomSheet
    handleClose={handleClose}
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
