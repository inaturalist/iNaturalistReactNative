// @flow

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { fontRegular } from "appConstants/fontFamilies.ts";
import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo, useRef, useState } from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  buttonText: string,
  confirm: Function,
  handleClose: Function,
  headerText: string,
  initialInput?: ?string,
  placeholder: string,
  textInputStyle?: Object
}

const TextInputSheet = ( {
  buttonText,
  confirm,
  handleClose,
  headerText,
  initialInput = null,
  placeholder,
  textInputStyle
}: Props ): Node => {
  const textInputRef = useRef( );
  const theme = useTheme( );
  const [input, setInput] = useState( initialInput );
  const [hasChanged, setHasChanged] = useState( false );
  const { t } = useTranslation( );

  // disable if user hasn't changed existing text
  const confirmButtonDisabled = initialInput === input && !hasChanged;

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
            onChangeText={text => {
              if ( !hasChanged ) {
                setHasChanged( true );
              }
              setInput( text );
            }}
            placeholder={placeholder}
            testID="TextInputSheet.notes"
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
          testID="TextInputSheet.confirm"
          className="mt-5"
          disabled={confirmButtonDisabled}
          level="primary"
          text={buttonText || t( "DONE" )}
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
