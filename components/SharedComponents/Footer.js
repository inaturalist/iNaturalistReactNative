// @flow strict-local

import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { viewStyles } from "../../styles/sharedComponents/footer";

const Footer = ( ): React.Node => (
  <View style={[viewStyles.row, viewStyles.shadow]}>
    <Pressable>
      <Text>menu</Text>
    </Pressable>
    <Pressable>
      <Text>explore</Text>
    </Pressable>
    <Pressable>
      <Text>camera</Text>
    </Pressable>
    <Pressable>
      <Text>obs list</Text>
    </Pressable>
    <Pressable>
      <Text>notifications</Text>
    </Pressable>
  </View>
);

export default Footer;
