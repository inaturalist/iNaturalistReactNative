import {
  BottomSheet,
  ButtonBar,
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
  loading: boolean;
  onPressClose: () => void;
  secondButtonText?: string;
  testID?: string;
  text?: string;
  rawText?: string;
}

const WarningSheet = ( {
  buttonText,
  buttonType,
  confirm,
  handleSecondButtonPress,
  headerText,
  hidden,
  insideModal,
  loading,
  onPressClose,
  secondButtonText,
  testID,
  text,
  rawText
}: Props ) => {
  const buttons = [
    {
      title: buttonText,
      onPress: confirm,
      disabled: loading,
      level: buttonType || "warning",
      loading,
      className: "grow ml-3"
    }
  ];

  if ( secondButtonText && handleSecondButtonPress ) {
    buttons.unshift( {
      title: secondButtonText,
      isPrimary: false,
      onPress: handleSecondButtonPress
    } );
  }

  return (
    <BottomSheet
      onPressClose={onPressClose}
      headerText={headerText}
      hidden={hidden}
      insideModal={insideModal}
    >
      <View className="flex-col items-center p-5" testID={testID}>
        {text && <List2 className="mb-6">{text}</List2>}
        {rawText}
        <ButtonBar buttonConfiguration={buttons} />
      </View>
    </BottomSheet>
  );
};

export default WarningSheet;
