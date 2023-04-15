// @flow

import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Dimensions, findNodeHandle, Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";

type Props = {
  addNotes: Function,
  description: ?string,
  scrollToInput: Function
}

const { width: screenWidth } = Dimensions.get( "screen" );

const Notes = ( { addNotes, description, scrollToInput }: Props ): Node => {
  const theme = useTheme( );
  const [localDescription, setLocalDescription] = useState( description );

  return (
    <View className="flex-row flex-nowrap items-center ml-1 mt-2.5">
      <INatIcon
        size={14}
        name="pencil-outline"
      />
      <TextInput
        accessibilityLabel="Text input field"
        keyboardType="default"
        multiline
        mode="flat"
        onChangeText={text => setLocalDescription( text )}
        onBlur={( ) => addNotes( localDescription )}
        value={localDescription}
        placeholder={t( "Add-optional-notes" )}
        className="bg-white"
        testID="ObsEdit.notes"
        activeUnderlineColor={theme.colors.onPrimary}
        underlineColor={theme.colors.onPrimary}
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
        // theme={{ fontFamily: theme.fonts.regular.fontFamily }}
        onFocus={e => scrollToInput( findNodeHandle( e.target ) )}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          margin: 0,
          paddingLeft: 5,
          fontSize: 14,
          fontWeight: "400",
          maxWidth: screenWidth - 60,
          lineHeight: 18
        }}
        dense
      />
    </View>
  );
};

export default Notes;
