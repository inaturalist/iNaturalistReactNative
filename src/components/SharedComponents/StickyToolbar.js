// @flow
import classNames from "classnames";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTheme } from "react-native-paper";
import getShadowStyle from "sharedHelpers/getShadowStyle";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: -2,
  opacity: 0.25,
  radius: 2
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
