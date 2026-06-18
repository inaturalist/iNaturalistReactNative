import { useNavigation } from "@react-navigation/native";
import {
  ImageBackground, ScrollView, View,
} from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import type {
  ImageSourcePropType,
  ImageStyle,
  ScrollView as RNScrollView,
  StyleProp,
} from "react-native";
import {
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props extends PropsWithChildren {
  backgroundSource: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  scrollViewRef?: React.RefObject<RNScrollView | null>;
}

const windowHeight = Dimensions.get( "window" ).height;

const SCROLL_VIEW_STYLE = {
  minHeight: windowHeight * 1.1,
  paddingTop: 54,
} as const;

const LoginSignupWrapper = ( {
  backgroundSource,
  children,
  imageStyle,
  scrollViewRef,
}: Props ) => {
  // Consumers that need to control the scroll (e.g. Login) pass their own ref in;
  // otherwise we keep an internal ref so scroll-reset-on-focus still works.
  const internalRef = useRef<RNScrollView>( null );
  const ref = scrollViewRef ?? internalRef;
  const navigation = useNavigation( );
  const insets = useSafeAreaInsets();

  const resetScroll = useCallback( ( ) => {
    const scrollNode = ref.current;
    if ( scrollNode && typeof scrollNode.scrollTo === "function" ) {
      scrollNode.scrollTo( { y: 0, animated: false } );
    }
  }, [ref] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      resetScroll( );
    } );
    return unsubscribe;
  }, [navigation, resetScroll] );

  const fitContentWithinScreenStyle = { height: windowHeight * 0.85 };

  return (
    <ImageBackground
      source={backgroundSource}
      className="h-full w-full"
      imageStyle={imageStyle}
    >
      <View style={{ paddingTop: insets.top }}>
        <StatusBar
          barStyle="light-content"
        />
        <ScrollView
          ref={ref}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={SCROLL_VIEW_STYLE}
        >
          <View style={fitContentWithinScreenStyle}>
            <View className="flex-1 flex-column justify-between">
              {children}
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default LoginSignupWrapper;
