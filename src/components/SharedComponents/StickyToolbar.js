// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const getShadow = shadowColor => StyleSheet.create( {
  shadowColor,
  shadowOffset: {
    width: 0,
    height: -2
  },
  // $FlowIssue[incompatible-shape]
  shadowOpacity: 0.25,
  // $FlowIssue[incompatible-shape]
  shadowRadius: 2,
  // $FlowIssue[incompatible-shape]
  elevation: 5
} );

type Props = {
  containerClass?: string,
  children: React.Node
}

// Ensure this component is placed outside of scroll views

const StickyToolbar = ( {
  containerClass,
  children
}: Props ): React.Node => {
  const theme = useTheme( );

  return (
    <View
      className={classNames(
        "absolute z-50 bg-white bottom-0 p-[15px] w-full",
        containerClass
      )}
      style={getShadow( theme.colors.primary )}
    >
      {children}
    </View>
  );
};

export default StickyToolbar;
