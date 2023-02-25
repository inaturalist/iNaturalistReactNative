// @flow

import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

import Icon from "./INatIcon";

// Flow types for the props
type Props = {
  name: string,
  color?: string,
  size?: number
};

const INatIcon = ( { name, color, size }: Props ): Node => {
  const theme = useTheme();
  // Use default color if none is specified
  return <Icon name={name} color={color || theme.colors.primary} size={size} />;
};

export default INatIcon;
