import { useNavigation } from "@react-navigation/native";
import {
  ImageBackground, ScrollView, View,
} from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useCallback, useEffect, useRef } from "react";
import type {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from "react-native";
import {
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

type ScrollViewRef = { scrollTo: (options: { y: number; animated: boolean }) => void } | null;

interface Props extends PropsWithChildren {
  backgroundSource: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
}

const windowHeight = Dimensions.get("window").height;

const SCROLL_VIEW_STYLE = {
  minHeight: windowHeight * 1.1,
  paddingTop: 54,
} as const;

const LoginSignupWrapper = ({
  backgroundSource,
  children,
  imageStyle,
}: Props) => {
  const scrollViewRef = useRef<ScrollViewRef>(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const resetScroll = useCallback(() => {
    const scrollNode = scrollViewRef.current;
    if (scrollNode && typeof scrollNode.scrollTo === "function") {
      scrollNode.scrollTo({ y: 0, animated: false });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      resetScroll();
    });
    return unsubscribe;
  }, [navigation, resetScroll]);

  // Make the StatusBar translucent in Android but reset it when we leave
  // because this alters the layout.
  useEffect(() => {
    if (Platform.OS !== "android") return () => undefined;
    // Hide on first render
    StatusBar.setTranslucent(true);
    const unsubscribe = navigation.addListener("focus", () => {
      resetScroll();
      // Hide when focused
      StatusBar.setTranslucent(true);
    });
    return unsubscribe;
  }, [navigation, resetScroll]);

  useEffect(() => {
    if (Platform.OS !== "android") return () => undefined;
    const unsubscribe = navigation.addListener("blur", () => {
      StatusBar.setTranslucent(false);
    });
    return unsubscribe;
  }, [navigation]);

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
                ? children({ scrollViewRef })
                : children}
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default LoginSignupWrapper;
