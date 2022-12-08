// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { findNodeHandle } from "react-native";
import { TextInput } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  addNotes: Function,
  description: ?string,
  scrollToInput: Function
}

const Notes = ( { addNotes, description, scrollToInput }: Props ): Node => {
  const [localDescription, setLocalDescription] = useState( description );

  return (
    <TextInput
      keyboardType="default"
      multiline
      onChangeText={text => setLocalDescription( text )}
      onBlur={( ) => addNotes( localDescription )}
      value={localDescription}
      placeholder={t( "Add-optional-notes" )}
      className="pl-3 bg-white"
      testID="ObsEdit.notes"
      underlineColor={colors.white}
      onFocus={e => scrollToInput( findNodeHandle( e.target ) )}
    />
  );
};

export default Notes;
