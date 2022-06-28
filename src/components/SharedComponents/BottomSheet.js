// @flow

import React from "react";
import { View } from "react-native";
import type { Node } from "react";
import { viewStyles } from "../../styles/sharedComponents/bottomSheet";

type Props = {
  children: any,
  height?: number
}

const BottomSheet = ( { children, height }: Props ): Node => (
  <View style={[viewStyles.bottomSheet, { height }]}>
    {children}
  </View>
);

export default BottomSheet;
