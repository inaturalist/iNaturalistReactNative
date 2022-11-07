// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { TextInput } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  addNotes: Function,
  description: ?string
}

const Notes = ( { addNotes, description }: Props ): Node => {
  const [keyboardOffset, setKeyboardOffset] = useState( 0 );
  const [localDescription, setLocalDescription] = useState( description );

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

  let textInputStyle = "pl-3 bg-white";

  // TODO: Figure out how to position element exactly above keyboard with Tailwind
  if ( keyboardOffset > 0 ) {
    textInputStyle += ` absolute w-full ${Platform.OS === "ios" ? "bottom-28" : "bottom-36"}`;
  }

  return (
    <TextInput
      keyboardType="default"
      multiline
      onChangeText={text => setLocalDescription( text )}
      onBlur={( ) => addNotes( localDescription )}
      value={localDescription}
      placeholder={t( "Add-optional-notes" )}
      className={textInputStyle}
      testID="ObsEdit.notes"
      underlineColor={colors.white}
    />
  );
};

export default Notes;
