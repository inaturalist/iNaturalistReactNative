// @flow

import { INatIcon } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import {
  MD3LightTheme as DefaultTheme,
  Provider as PaperProvider
} from "react-native-paper";
import colors from "styles/tailwindColors";

const theme = {
  ...DefaultTheme,
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
    primary: colors.darkGray,
    secondary: colors.inatGreen // TODO: change to accessibleGreen for accessibility
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
