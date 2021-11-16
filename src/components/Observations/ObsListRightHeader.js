// @flow

import * as React from "react";
import { Text, Pressable } from "react-native";

import { viewStyles } from "../../styles/observations/obsListRightHeader";

const ObsListRightHeader = ( ): React.Node => (
  <Pressable onPress={( ) => console.log( "navigate to messages" )} style={viewStyles.messages}>
    <Text>messages</Text>
  </Pressable>
);

export default ObsListRightHeader;
