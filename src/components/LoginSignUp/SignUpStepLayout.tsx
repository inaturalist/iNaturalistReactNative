import { useNavigation } from "@react-navigation/native";
import useOnboardingExitSheet from "components/Onboarding/useOnboardingExitSheet";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import {
  Image, LinearGradient, ScrollView, View,
} from "components/styledComponents";
import type { PropsWithChildren, ReactNode } from "react";
import React from "react";
import type { ImageSourcePropType } from "react-native";
import { StatusBar, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

// The photo fills the top of the screen at the design's 402×604 proportions,
// darkened by half and fading to black behind the form
const BACKGROUND_ASPECT_RATIO = 604 / 402;
const BACKGROUND_FADE_COLORS = ["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.5)", "black"];
const BACKGROUND_FADE_LOCATIONS = [0, 0.335, 0.555];
// Where the design puts the top of the content: 277pt down the 604pt photo
const CONTENT_TOP_FRACTION = 277 / 604;
const HEADER_HEIGHT = 59;
const MIN_CONTENT_TOP_SPACE = 24;

interface Props extends PropsWithChildren {
  backgroundSource: ImageSourcePropType;
  // Pinned to the bottom of the screen, below the scrolling content
  footer?: ReactNode;
}

// Frame for the onboarding sign-up steps: a dark photo background, a back
// button, and a close button on steps with an exit sheet
const SignUpStepLayout = ( { backgroundSource, children, footer }: Props ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const insets = useSafeAreaInsets( );
  const { width } = useWindowDimensions( );
  const { stepId } = useOnboardingFlow( );
  const { exitSheet, exitSheetElement, openExitSheet } = useOnboardingExitSheet( stepId );
  const backgroundHeight = width * BACKGROUND_ASPECT_RATIO;
  const backgroundStyle = { width, height: backgroundHeight };
  // Shrinks on short screens so the form stays above the fold
  const contentTopSpacerStyle = {
    flexGrow: 1,
    minHeight: MIN_CONTENT_TOP_SPACE,
    maxHeight: Math.max(
      MIN_CONTENT_TOP_SPACE,
      backgroundHeight * CONTENT_TOP_FRACTION - insets.top - HEADER_HEIGHT,
    ),
  };

  return (
    <View
      className="flex-1 bg-black"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      testID={`Onboarding.${stepId}`}
    >
      <StatusBar barStyle="light-content" />
      <Image
        source={backgroundSource}
        className="absolute top-0 left-0"
        style={backgroundStyle}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={BACKGROUND_FADE_COLORS}
        locations={BACKGROUND_FADE_LOCATIONS}
        className="absolute top-0 left-0"
        style={backgroundStyle}
      />
      <View
        className="flex-row justify-between items-center"
        style={{ height: HEADER_HEIGHT }}
      >
        <INatIconButton
          icon="chevron-left"
          size={22}
          color={colors.white}
          accessibilityLabel={t( "Go-back" )}
          onPress={( ) => navigation.goBack( )}
          testID={`Onboarding.${stepId}.back`}
        />
        {exitSheet && (
          <INatIconButton
            icon="close"
            size={19}
            color={colors.white}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Asks-whether-to-exit" )}
            onPress={openExitSheet}
            testID={`Onboarding.${stepId}.close`}
          />
        )}
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-[21px] pb-[20px]"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        alwaysBounceVertical={false}
      >
        <View style={contentTopSpacerStyle} />
        {children}
        <View className="grow" />
      </ScrollView>
      {footer && (
        <View className="items-center px-[21px] pb-[20px]">
          {footer}
        </View>
      )}
      {exitSheetElement}
    </View>
  );
};

export default SignUpStepLayout;
