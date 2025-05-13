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
import { Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useKeyboardInfo from "sharedHooks/useKeyboardInfo";
import useTranslation from "sharedHooks/useTranslation.ts";
import colors from "styles/tailwindColors";

// Optimized to maximize input size while minimizing post-render height
// adjustments for for iPhone 13 and taller screens. Shorter screens
// (e.g. iPhone SE) will jerk around a bit to avoid the top inset
const TARGET_INPUT_HEIGHT = 220;

type Props = {
  buttonText: string,
  confirm: Function,
  description?: string,
  onPressClose: Function,
  headerText: string,
  initialInput?: string,
  maxLength?: number,
  placeholder?: string,
  textInputStyle?: Object
}

const CharLimit = ( { current = 0, limit = 1, t } ) => {
  let currentColor = "text-darkGrayDisabled";
  if ( current / limit >= 1 ) {
    currentColor = "text-warningRed";
  } else if ( current / limit > 0.9 ) {
    currentColor = "text-warningRedDisabled";
  }
  return (
    <View className="flex-row space-x-1">
      <Body3 className={`${currentColor}`}>
        { t( "Intl-number", { val: current } ) }
      </Body3>
      <Body3 className="text-darkGrayDisabled">
        /
      </Body3>
      <Body3 className="text-darkGrayDisabled">
        { t( "Intl-number", { val: limit } ) }
      </Body3>
    </View>
  );
};

const TextInputSheet = ( {
  buttonText,
  confirm,
  description,
  onPressClose,
  headerText,
  initialInput,
  maxLength,
  placeholder,
  textInputStyle
}: Props ): Node => {
  const textInputRef = useRef( );
  const [input, setInput] = useState( initialInput );
  const { t } = useTranslation( );
  const { nonKeyboardHeight } = useKeyboardInfo( TARGET_INPUT_HEIGHT );
  const { top: topInset } = useSafeAreaInsets( );
  const [sheetHeight, setSheetHeight] = useState( 0 );

  // disable if user hasn't changed existing text
  const confirmButtonDisabled = initialInput === input || ( !input && !initialInput );

  const inputStyle = useMemo( ( ) => ( {
    height: Math.min(
      TARGET_INPUT_HEIGHT - ( sheetHeight - nonKeyboardHeight ) - topInset,
      TARGET_INPUT_HEIGHT
    ),
    fontFamily: fontRegular,
    fontSize: 14,
    lineHeight: 17,
    color: colors.darkGray,
    textAlignVertical: "top"
  } ), [
    nonKeyboardHeight,
    sheetHeight,
    topInset
  ] );

  const dismissKeyboardAndClose = ( ) => {
    Keyboard.dismiss( );
    onPressClose( );
  };

  return (
    <BottomSheet
      onPressClose={dismissKeyboardAndClose}
      headerText={headerText}
      keyboardShouldPersistTaps="always"
      onLayout={event => {
        const { height } = event.nativeEvent.layout;
        // Only do this once. Device height isn't going to change
        if ( sheetHeight === 0 ) {
          setSheetHeight( height );
        }
      }}
    >
      <View className="p-5 pb-0">
        { description && description.length > 0 && (
          <View className="p-3 pt-0">
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
              setInput( text );
            }}
            placeholder={placeholder}
            testID="TextInputSheet.notes"
            style={[inputStyle, textInputStyle]}
            autoFocus
            defaultValue={input}
            maxFontSizeMultiplier={2}
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
              <CharLimit current={input?.length} limit={maxLength} t={t} />
            ) }
            <Pressable
              onPress={() => {
                textInputRef?.current?.clear();
                if ( Platform.OS === "android" ) {
                  setInput( "" );
                }
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
            // If the confirm() callback returns false, something went wrong
            // and the user may need to edit the text or do something else
            // before we close the sheet
            if ( confirm( input ) !== false ) {
              dismissKeyboardAndClose( );
            }
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default TextInputSheet;
