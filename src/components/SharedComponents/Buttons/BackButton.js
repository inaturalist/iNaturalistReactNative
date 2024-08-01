import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Image } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import {
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  color?: string,
  onPress?: Function,
  inCustomHeader?: boolean,
  customStyles?: Object,
  testID?: string
}

// const REACT_NAVIGATION_BACK_BUTTON_STYLE = {
// start: Platform.OS === "ios"
//   ? -15
//   : 0,
// minWidth: 44,
// minHeight: 44
// };

// lifted from
// https://github.com/react-navigation/react-navigation/blob/395410a7a751492ad846c7723dd33b55891173e1/packages/elements/src/Header/HeaderBackButton.tsx
const REACT_NAVIGATION_BACK_BUTTON_STYLES = {
  container: {
    paddingHorizontal: 0,
    minWidth: StyleSheet.hairlineWidth, // Avoid collapsing when title is long
    ...Platform.select( {
      ios: null,
      default: {
        marginVertical: 3,
        marginHorizontal: 11
      }
    } )
  },
  icon: Platform.select( {
    ios: {
      height: 21,
      width: 13,
      marginStart: 8,
      marginEnd: 22,
      marginVertical: 8
    },
    default: {
      height: 24,
      width: 24,
      margin: 3
    }
  } )
};

const BackButton = ( {
  color = colors.black,
  onPress,
  inCustomHeader,
  customStyles,
  testID = "BackButton"
}: Props ): Node => {
  const navigation = useNavigation();
  const tintColor = color || colors.black;
  const { t } = useTranslation( );

  const backImage = ( ) => (
    <Image
      testID="Image.BackButton"
      source={require( "images/backIcons/back-icon.png" )}
      tintColor={tintColor}
      accessibilityIgnoresInvertColors
      style={[
        !inCustomHeader && REACT_NAVIGATION_BACK_BUTTON_STYLES.icon,
        Boolean( tintColor ) && { tintColor },
        customStyles
      ]}
      resizeMode="contain"
      fadeDuration={0}
    />
  );

  if ( navigation?.canGoBack( ) ) {
    return (
      <HeaderBackButton
        accessibilityLabel={t( "Go-back" )}
        backImage={backImage}
        labelVisible={false}
        onPress={onPress || navigation.goBack}
        style={[
          REACT_NAVIGATION_BACK_BUTTON_STYLES.container
        ]}
        // move backbutton to same start as in react-navigation
        // style={[
        //   !inCustomHeader && REACT_NAVIGATION_BACK_BUTTON_STYLE,
        //   customStyles
        // ]}
        testID={testID}
        // tintColor={tintColor}
      />
    );
  }

  return null;
};

export default BackButton;
