// @flow

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

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
    fontFamily: `Whitney-Light${Platform.OS === "ios"
      ? ""
      : "-Pro"}`,
    fontSize: 14,
    lineHeight: 17,
    color: theme.colors.primary,
    borderRadius: 8,
    borderColor: colors.lightGray,
    borderWidth: 1,
    padding: 15,
    textAlignVertical: "top"
  } ), [theme] );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
    >
      <View className="p-5">
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
          className="z-50 absolute bottom-20 right-5 p-5"
          onPress={() => {
            textInputRef?.current?.clear();
          }}
        >
          {t( "Clear" )}
        </Body3>
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
