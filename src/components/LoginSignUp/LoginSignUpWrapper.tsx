import { useNavigation } from "@react-navigation/native";
import {
  ImageBackground, ScrollView, View
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  backgroundSource: ImageSourcePropType,
  imageStyle?: StyleProp<ImageStyle>
}

const windowHeight = Dimensions.get( "window" ).height;

const SCROLL_VIEW_STYLE = {
  minHeight: windowHeight * 1.1,
  paddingTop: 60
} as const;

const LoginSignupWrapper = ( {
  backgroundSource,
  children,
  imageStyle
}: Props ) => {
  const scrollViewRef = useRef( null );
  const navigation = useNavigation( );
  const insets = useSafeAreaInsets();

  useEffect( ( ) => {
    const resetScroll = ( ) => {
      if ( scrollViewRef.current ) {
        scrollViewRef.current?.scrollTo( { y: 0, animated: false } );
      }
    };
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      resetScroll( );
    } );
    return unsubscribe;
  }, [navigation] );

  // Make the StatusBar translucent in Android but reset it when we leave
  // because this alters the layout.
  useEffect( ( ) => {
    if ( Platform.OS !== "android" ) return ( ) => undefined;
    // Hide on first render
    StatusBar.setTranslucent( true );

    const resetScroll = () => {
      if ( scrollViewRef.current ) {
        scrollViewRef.current?.scrollTo( { y: 0, animated: false } );
      }
    };
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      console.log( "resetting scroll" );
      resetScroll( );
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

  // const fitContentWithinScreenStyle = { height: windowHeight * 0.85 };
  const fitContentWithinScreenStyle = { };

  return (
    <ImageBackground
      source={backgroundSource}
      className="h-full w-full"
      imageStyle={imageStyle}
    >
      <View style={{ paddingTop: insets.top }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.black}
        />
        <ScrollView
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
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default LoginSignupWrapper;
