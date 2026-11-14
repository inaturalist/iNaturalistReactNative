import type { ButtonConfiguration } from "components/SharedComponents/ButtonBar";
import ButtonBar from "components/SharedComponents/ButtonBar";
import BottomSheet from "components/SharedComponents/Sheets/BottomSheet";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body2 from "components/SharedComponents/Typography/Body2";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  cancelText: string;
  confirmText: string;
  headerText: string;
  // Called for CANCEL and for any other dismissal (backdrop tap, swipe down)
  onCancel: ( ) => void;
  onConfirm: ( ) => void;
  testID?: string;
  text: string;
}

// Asks the user to confirm a destructive choice: a left-aligned title and
// text above CANCEL and a red confirm button, with no close button
const ConfirmSheet = ( {
  cancelText,
  confirmText,
  headerText,
  onCancel,
  onConfirm,
  testID,
  text,
}: Props ) => {
  const buttons: ButtonConfiguration[] = [
    {
      title: cancelText,
      onPress: onCancel,
      isPrimary: false,
    },
    {
      title: confirmText,
      onPress: onConfirm,
      level: "warning",
      isPrimary: false,
      className: "grow ml-3",
    },
  ];

  return (
    <BottomSheet
      onPressClose={onCancel}
      hideCloseButton
      containerClass="pt-[27px]"
    >
      <View className="px-[30px] pb-5" testID={testID}>
        <Body1 className="mb-3" testID="bottom-sheet-header">{headerText}</Body1>
        <Body2 className="mb-6">{text}</Body2>
        <ButtonBar buttonConfiguration={buttons} />
      </View>
    </BottomSheet>
  );
};

export default ConfirmSheet;
