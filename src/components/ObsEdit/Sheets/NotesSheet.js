// @flow

import {
  Body3, BottomSheet, Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowNotesSheet: Function,
  addNotes: Function,
  description: ?string
}

const NotesSheet = ( {
  setShowNotesSheet,
  addNotes,
  description
}: Props ): Node => {
  const theme = useTheme( );
  const [localDescription, setLocalDescription] = useState( description );
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowNotesSheet( false ),
    [setShowNotesSheet]
  );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={t( "NOTES" )}
      snapPoints={[416]}
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
          onChangeText={text => setLocalDescription( text )}
          value={localDescription}
          placeholder={t( "Add-optional-notes" )}
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
          onPress={( ) => setLocalDescription( "" )}
        >
          {t( "Clear" )}
        </Body3>
        <Button
          level="primary"
          text={t( "CONFIRM" )}
          onPress={( ) => {
            addNotes( localDescription );
            handleClose( );
          }}
        />
      </View>
    </BottomSheet>
  );
};

export default NotesSheet;
