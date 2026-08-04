import { Picker } from "@react-native-picker/picker";
import {
  BottomSheet,
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

interface Props {
  onPressClose: ( ) => void;
  confirm: ( selection: boolean | string ) => void;
  headerText: string;
  pickerValues: Record<string, {
    label: string;
    value: boolean | string;
  }>;
  selectedValue: boolean | string;
  insideModal?: boolean;
}

interface PickerSheetContentProps {
  confirm: ( selection: boolean | string ) => void;
  pickerValues: Props["pickerValues"];
  selectedValue: boolean | string;
}

// Note re: dark mode: react-native-picker automatically handles user preferences when it comes
// to the color of the text, so when we add dark mode, we can remove the explicit styling.

// MOB-1165 intentionally separate component under BottomSheet: BottomSheetModal forwards
// children to its portal a tick late, so if PickerSheet owned `selection` above that boundary,
// it would race the native iOS picker's own state and causes a double-scroll on selection.
const PickerSheetContent = (
  { confirm, pickerValues, selectedValue }: PickerSheetContentProps,
) => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState( selectedValue );

  return (
    <View className="p-5">
      <Picker
        selectedValue={selection}
        onValueChange={itemValue => setSelection( itemValue )}
        testID="ReactNativePicker"
        itemStyle={{ color: colors.black }}
      >
        {Object.keys( pickerValues ).map( k => (
          <Picker.Item
            key={k}
            label={pickerValues[k].label}
            value={pickerValues[k].value}
            color={colors.black}
          />
        ) )}
      </Picker>
      <Button
        level="primary"
        text={t( "CONFIRM" )}
        onPress={( ) => confirm( selection )}
        className="mt-[15px]"
        accessibilityLabel={t( "CONFIRM" )}
      />
    </View>
  );
};

const PickerSheet = ( {
  onPressClose,
  confirm,
  headerText,
  pickerValues,
  selectedValue,
  insideModal,
}: Props ) => (
  <BottomSheet
    onPressClose={onPressClose}
    headerText={headerText}
    insideModal={insideModal}
    scrollEnabled={false}
    enablePanDownToClose={false}
    enableContentPanningGesture={false}
  >
    <PickerSheetContent
      confirm={confirm}
      pickerValues={pickerValues}
      selectedValue={selectedValue}
    />
  </BottomSheet>
);

export default PickerSheet;
