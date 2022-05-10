// @flow

import React from "react";
import { View } from "react-native";
import type { Node } from "react";
import { viewStyles } from "../../styles/sharedComponents/bottomModal";

type Props = {
  children: any,
  height?: number
}

const BottomModal = ( { children, height }: Props ): Node => (
  <View style={[viewStyles.bottomModal, { height }]}>
    {children}
  </View>
);

export default BottomModal;
