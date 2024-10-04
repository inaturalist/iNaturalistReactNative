// @flow

import { INatIcon } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider
} from "react-native-paper";
import colors from "styles/tailwindColors";

// it's still possible to access colors using theme,
// but it's more consistent to access them directly using
// import colors from "styles/tailwindColors";
const theme = {
  ...DefaultTheme,
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
    // keeping background here for react-native-paper TextInput
    background: colors.white
  }
};

// eslint-disable-next-line react/jsx-props-no-spreading
const renderCustomIcon = props => <INatIcon {...props} />;

type Props = {
  // $FlowIgnore
  children: unknown
}

const INatPaperProvider = ( { children }: Props ): Node => (
  <PaperProvider
    settings={{
      icon: renderCustomIcon
    }}
    theme={theme}
  >
    {children}
  </PaperProvider>
);

export default INatPaperProvider;
