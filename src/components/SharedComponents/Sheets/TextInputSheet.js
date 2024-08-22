// @flow

import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { fontRegular } from "appConstants/fontFamilies.ts";
import classnames from "classnames";
import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo, useRef, useState } from "react";
import { Keyboard } from "react-native";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  buttonText: string,
  confirm: Function,
  description?: string,
  handleClose: Function,
  headerText: string,
  initialInput?: string,
  maxLength?: number,
  placeholder: string,
  textInputStyle?: Object
}

const CharLimit = ( { current = 0, limit = 1 } ) => {
  let currentColor = "text-darkGrayDisabled";
  if ( current / limit >= 1 ) {
    currentColor = "text-warningRed";
  } else if ( current / limit > 0.9 ) {
    currentColor = "text-warningRedDisabled";
  }
  return (
    <View className="flex-row">
      <Body3 className={currentColor}>
        { current }
      </Body3>
      <Body3 className="text-darkGrayDisabled">
        { " / " }
        { limit }
      </Body3>
    </View>
  );
};

const TextInputSheet = ( {
  buttonText,
  confirm,
  description,
  handleClose,
  headerText,
  initialInput,
  maxLength,
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

  const dismissKeyboardAndClose = ( ) => {
    Keyboard.dismiss( );
    handleClose( );
  };

  return (
    <BottomSheet
      handleClose={dismissKeyboardAndClose}
      headerText={headerText}
      keyboardShouldPersistTaps="always"
    >
      <View className="p-5">
        { description && description.length > 0 && (
          <View className="p-3 pt-1">
            <Body3 className="text-center">{ description }</Body3>
          </View>
        ) }
        <View className="border rounded-lg border-lightGray p-3 pt-1">
          <BottomSheetTextInput
            ref={textInputRef}
            accessibilityLabel="Text input field"
            keyboardType="default"
            maxLength={maxLength}
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
          <View
            className={classnames(
              "flex-row",
              maxLength
                ? "justify-between"
                : "justify-end"
            )}
          >
            { maxLength && (
              <CharLimit current={input?.length} limit={maxLength} />
            ) }
            <Pressable
              onPress={() => {
                textInputRef?.current?.clear();
              }}
              accessibilityHint={t( "Deletes-entered-text" )}
              accessibilityRole="button"
            >
              <Body3>{t( "Clear" )}</Body3>
            </Pressable>
          </View>
        </View>
        <Button
          testID="TextInputSheet.confirm"
          className="mt-5"
          disabled={confirmButtonDisabled}
          level="primary"
          text={buttonText || t( "DONE" )}
          onPress={() => {
            confirm( input );
            dismissKeyboardAndClose( );
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default TextInputSheet;
