import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  ImageBackground, SafeAreaView, View
} from "components/styledComponents";
import React, {
  PropsWithChildren, useEffect, useRef
} from "react";
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp
} from "react-native";
import {
  Dimensions,
  Platform,
  StatusBar
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  backgroundSource: ImageSourcePropType,
  imageStyle?: StyleProp<ImageStyle>
}

const windowHeight = Dimensions.get( "window" ).height;

const SCROLL_VIEW_STYLE = {
  minHeight: windowHeight * 1.1
} as const;

const LoginSignupWrapper = ( {
  backgroundSource,
  children,
  imageStyle
}: Props ) => {
  const scrollViewRef = useRef( null );
  const navigation = useNavigation( );

  // Make the StatusBar translucent in Android but reset it when we leave
  // because this alters the layout.
  useEffect( ( ) => {
    if ( Platform.OS !== "android" ) return ( ) => undefined;
    // Hide on first render
    StatusBar.setTranslucent( true );

    const unsubscribe = navigation.addListener( "focus", ( ) => {
      // Hide when focused
      StatusBar.setTranslucent( true );
    } );
    return unsubscribe;
  }, [navigation] );

  useEffect( ( ) => {
    if ( Platform.OS !== "android" ) return ( ) => undefined;
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      StatusBar.setTranslucent( false );
    } );
    return unsubscribe;
  }, [navigation] );

  const fitContentWithinScreenStyle = { height: windowHeight * 0.85 };

  return (
    <ImageBackground
      source={backgroundSource}
      className="h-full w-full"
      imageStyle={imageStyle}
    >
      <SafeAreaView
        className={classnames(
          "w-full",
          "h-full",
          // In LoginStackNavigator we set `headerTransparent: true`, but this
          // makes content inside the SafeAreaView stay there in iOS but flow
          // up under the header area in Android. Barring a better solution,
          // this makes sure content stay below the header on Android
          Platform.OS === "android" && "pt-[60px]"
        )}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.black}
        />
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={SCROLL_VIEW_STYLE}
        >
          <View style={fitContentWithinScreenStyle}>
            <View className="flex-1 flex-column justify-between">
              {typeof children === "function"
                ? children( { scrollViewRef } )
                : children}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginSignupWrapper;
