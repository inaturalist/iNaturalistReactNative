// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { ImageBackground, SafeAreaView, ScrollView } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";

type Props = {
  // $FlowIgnore
  backgroundSource: unknown,
  // $FlowIgnore
  children: unknown,
  imageStyle?: Object,
  keyboardVerticalOffset?: number,
  scrollEnabled?: boolean
}

const KEYBOARD_AVOIDING_VIEW_STYLE = {
  flex: 1,
  flexGrow: 1
};

const SCROLL_VIEW_STYLE = {
  flex: 1,
  justifyContent: "space-between"
};

const LoginSignupWrapper = ( {
  backgroundSource,
  children,
  imageStyle,
  keyboardVerticalOffset,
  scrollEnabled = true
}: Props ): Node => {
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
          backgroundColor="#0000"
        />
        <KeyboardAvoidingView
          keyboardVerticalOffset={keyboardVerticalOffset}
          behavior="padding"
          style={KEYBOARD_AVOIDING_VIEW_STYLE}
        >
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={SCROLL_VIEW_STYLE}
            scrollEnabled={scrollEnabled}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginSignupWrapper;
