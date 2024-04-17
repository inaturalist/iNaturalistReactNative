// @flow

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { fontRegular } from "constants/fontFamilies.ts";
import type { Node } from "react";
import React, { useMemo, useRef, useState } from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  confirm: Function,
  initialInput?: ?string,
  placeholder: string,
  headerText: string,
  textInputStyle?: Object
}

const TextInputSheet = ( {
  handleClose,
  confirm,
  initialInput = null,
  placeholder,
  headerText,
  textInputStyle
}: Props ): Node => {
  const textInputRef = useRef( );
  const theme = useTheme( );
  const [input, setInput] = useState( initialInput );
  const { t } = useTranslation( );

  const inputStyle = useMemo( ( ) => ( {
    height: 223,
    fontFamily: fontRegular,
    fontSize: 14,
    lineHeight: 17,
    color: theme.colors.primary,
    textAlignVertical: "top"
  } ), [theme] );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
    >
      <View className="p-5">
        <View className="border rounded-lg border-lightGray p-3 pt-1">
          <BottomSheetTextInput
            ref={textInputRef}
            accessibilityLabel="Text input field"
            keyboardType="default"
            multiline
            onChangeText={text => setInput( text )}
            placeholder={placeholder}
            testID="ObsEdit.notes"
            style={[inputStyle, textInputStyle]}
            autoFocus
            defaultValue={input}
          />
          <Body3
            className="self-end"
            onPress={() => {
              textInputRef?.current?.clear();
            }}
          >
            {t( "Clear" )}
          </Body3>
        </View>
        <Button
          testID="ObsEdit.confirm"
          className="mt-5"
          level="primary"
          text={t( "DONE" )}
          onPress={() => {
            confirm( input );
            handleClose();
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default TextInputSheet;
