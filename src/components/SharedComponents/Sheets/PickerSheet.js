// @flow

import { Picker } from "@react-native-picker/picker";
import {
  BottomSheet,
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  onPressClose: Function,
  confirm: Function,
  headerText: string,
  pickerValues: Object,
  selectedValue: boolean | string,
  insideModal?: boolean
};

const PickerSheet = ( {
  onPressClose,
  confirm,
  headerText,
  pickerValues,
  selectedValue,
  insideModal
}: Props ): Node => {
  const { t } = useTranslation();
  const [selection, setSelection] = useState( selectedValue );

  return (
    <BottomSheet
      onPressClose={onPressClose}
      headerText={headerText}
      insideModal={insideModal}
    >
      <View className="p-5">
        <Picker
          selectedValue={selection}
          onValueChange={itemValue => setSelection( itemValue )}
          testID="ReactNativePicker"
        >
          {Object.keys( pickerValues ).map( k => (
            <Picker.Item
              key={k}
              label={pickerValues[k].label}
              value={pickerValues[k].value}
            />
          ) )}
        </Picker>
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={() => confirm( selection )}
          className="mt-[15px]"
          accessibilityLabel={t( "CONFIRM" )}
        />
      </View>
    </BottomSheet>
  );
};

export default PickerSheet;
