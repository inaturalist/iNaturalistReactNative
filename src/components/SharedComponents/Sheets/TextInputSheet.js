// @flow

import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

  type Props = {
    handleClose: Function,
    confirm: Function,
    initialInput?: ?string,
    placeholder: string,
    headerText: string,
    snapPoints: Array<Object>
  }

const TextInputSheet = ( {
  handleClose,
  confirm,
  initialInput = null,
  placeholder,
  headerText,
  snapPoints
}: Props ): Node => {
  const theme = useTheme( );
  const [input, setInput] = useState( initialInput );
  const { t } = useTranslation( );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
      snapPoints={snapPoints}
      onChange={position => {
        if ( position === -1 ) {
          handleClose( );
        }
      }}
    >
      <View className="p-5">
        <TextInput
          accessibilityLabel="Text input field"
          keyboardType="default"
          multiline
          mode="flat"
          onChangeText={text => setInput( text )}
          value={input}
          placeholder={placeholder}
          className="bg-white border border-lightGray min-h-[223px] mb-5"
          testID="ObsEdit.notes"
          // kind of tricky to change the font here:
          // https://github.com/callstack/react-native-paper/issues/3615#issuecomment-1402025033
          theme={{
            fonts: {
              bodyLarge:
              {
                ...theme.fonts.bodyLarge,
                fontFamily: `Whitney-Light${Platform.OS === "ios" ? "" : "-Pro"}`
              }
            }
          }}
        />
        <Body3
          className="z-50 absolute bottom-20 right-5 p-5"
          onPress={( ) => setInput( "" )}
        >
          {t( "Clear" )}
        </Body3>
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={confirm}
        />
      </View>
    </BottomSheet>
  );
};

export default TextInputSheet;
