// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Keyboard, useWindowDimensions } from "react-native";
import { TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "../../styles/colors";
import { textStyles } from "../../styles/obsEdit/notes";

type Props = {
  addNotes: Function,
  description: ?string
}

const Notes = ( { addNotes, description }: Props ): Node => {
  const [keyboardOffset, setKeyboardOffset] = useState( 0 );
  const { width } = useWindowDimensions( );
  const insets = useSafeAreaInsets( );

  useEffect( ( ) => {
    const showSubscription = Keyboard.addListener( "keyboardDidShow", e => {
      setKeyboardOffset( e.endCoordinates.height );
    } );
    const hideSubscription = Keyboard.addListener( "keyboardDidHide", ( ) => {
      setKeyboardOffset( 0 );
    } );

    return ( ) => {
      showSubscription.remove( );
      hideSubscription.remove( );
    };
  }, [] );

  const offset = {
    position: "absolute",
    width,
    bottom: keyboardOffset - insets.bottom
  };

  return (
    <TextInput
      keyboardType="default"
      multiline
      onChangeText={addNotes}
      value={description}
      placeholder={t( "Add-optional-notes" )}
      style={[textStyles.notes, keyboardOffset > 0 && offset]}
      testID="ObsEdit.notes"
      underlineColor={colors.white}
    />
  );
};

export default Notes;
