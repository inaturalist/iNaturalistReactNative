import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { ImageBackground, SafeAreaView, ScrollView } from "components/styledComponents";
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
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  backgroundSource: ImageSourcePropType,
  imageStyle?: StyleProp<ImageStyle>
}

const SCROLL_VIEW_STYLE = {
  // Make sure content can expand beyond the screen height to enable scrolling
  minHeight: Dimensions.get( "window" ).height * 1.1
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
    // StatusBar.setTranslucent( true );
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

  return (
    <ImageBackground
      source={backgroundSource}
      className="h-full"
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
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={SCROLL_VIEW_STYLE}
        >
          {typeof children === "function"
            ? children( { scrollViewRef } )
            : children}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginSignupWrapper;
