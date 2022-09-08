// @flow

import {
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer
} from "@react-navigation/native";
import merge from "deepmerge";
import * as React from "react";
import {
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider
} from "react-native-paper";

import colors from "../styles/colors";

const PRIMARY = "#5D8017";
const PRIMARY_DISABLED = "#C6DC98";
const WARNING = "#9B1111";
const WARNING_DISABLED = "#B95F5E";
const NEUTRAL = "#979797";
const NEUTRAL_DISABLED = "#D3D3D3";

const inatTheme = {
  ...PaperDefaultTheme,
  container: {
    flex: 1
  },
  colors: {
    primary: colors.inatGreen,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    surface: colors.white,
    // elevation lifted from LightTheme rather than DefaultTheme
    // needed level3 here to prevent a crash when opening Dialogs
    // https://github.com/callstack/react-native-paper/blob/11686c5efb1668564ba769f49a37b4d80ce7177e/src/styles/themes/v3/LightTheme.tsx#L49
    elevation: {
      level0: "transparent",
      level1: "rgb(247, 243, 249)",
      level2: "rgb(243, 237, 246)",
      level3: "rgb(238, 232, 244)",
      level4: "rgb(236, 230, 243)",
      level5: "rgb(233, 227, 241)"
    }
  },
  inputField: {
    height: 36,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  },
  button: {
    buttonDefault: {
      borderRadius: 40,
      height: 48
    },
    buttonPrimary: {
      backgroundColor: PRIMARY,
      borderColor: PRIMARY
    },
    buttonWarning: {
      backgroundColor: WARNING,
      borderColor: WARNING
    },
    buttonNeutral: {
      backgroundColor: NEUTRAL,
      borderColor: NEUTRAL
    },
    buttonPrimaryDisabled: {
      backgroundColor: PRIMARY_DISABLED,
      borderColor: PRIMARY_DISABLED
    },
    buttonNeutralDisabled: {
      backgroundColor: NEUTRAL_DISABLED,
      borderColor: NEUTRAL_DISABLED
    },
    buttonWarningDisabled: {
      backgroundColor: WARNING_DISABLED,
      borderColor: WARNING_DISABLED
    },
    buttonSecondary: {
      textDecorationLine: "underline",
      fontSize: 16
    }
  },
  text: {
    buttonTextDefault: {
      fontSize: 17,
      fontWeight: "500",
      color: colors.white
    },
    errorText: {
      color: colors.red,
      marginTop: 20,
      textAlign: "center"
    },
    inputFieldLabel: {
      fontSize: 18,
      marginBottom: 5,
      marginTop: 10
    }
  }
};

const CombinedDefaultTheme = merge( inatTheme, NavigationDefaultTheme );

type Props = {
  children: any
}

const ThemeProvider = ( { children }: Props ): React.Node => (
  <PaperProvider theme={CombinedDefaultTheme}>
    <NavigationContainer theme={CombinedDefaultTheme}>
      {children}
    </NavigationContainer>
  </PaperProvider>
);

export default ThemeProvider;
