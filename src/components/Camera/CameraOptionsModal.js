// @flow

import * as React from "react";
import { Text, View } from "react-native";

import { textStyles } from "../../styles/sharedComponents/modal";

const CameraOptionsModal = ( ): React.Node => (
  <View>
    <Text style={textStyles.whiteText}>take photo with camera</Text>
    <Text style={textStyles.whiteText}>upload photo from gallery</Text>
    <Text style={textStyles.whiteText}>record a sound</Text>
    <Text style={textStyles.whiteText}>submit without evidence</Text>
  </View>
);

export default CameraOptionsModal;
