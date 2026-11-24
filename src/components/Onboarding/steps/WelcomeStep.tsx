import { tailwindFontBold } from "appConstants/fontFamilies";
import classnames from "classnames";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import Body1 from "components/SharedComponents/Typography/Body1";
import Body3 from "components/SharedComponents/Typography/Body3";
import List2 from "components/SharedComponents/Typography/List2";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import {
  Image, LinearGradient, Text, View,
} from "components/styledComponents";
import INatLogo from "images/svg/inat_logo_color.svg";
import React, { useState } from "react";
import { Trans } from "react-i18next";
import type { ImageRequireSource } from "react-native";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTranslation from "sharedHooks/useTranslation";
import { getShadow } from "styles/global";

const COLLAGE_TOP = require( "images/onboarding/welcome_collage_top.jpg" );
const COLLAGE_BOTTOM = require( "images/onboarding/welcome_collage_bottom.jpg" );

const heightPerWidth = ( source: ImageRequireSource ) => {
  const { width, height } = Image.resolveAssetSource( source );
  return height / width;
};
// The collages split the height left over by the text and buttons in the
// ratio of their heights at the same width
const COLLAGE_TOP_RATIO = heightPerWidth( COLLAGE_TOP );
const COLLAGE_BOTTOM_RATIO = heightPerWidth( COLLAGE_BOTTOM );

// The terms line has to stay on screen (it's the consent for Apple/Google
// sign-up), so this doesn't scroll and the collages give up height on short
// screens instead. Each is pinned to the edge nearest the logo
const WelcomeStep = ( ) => {
  const { t } = useTranslation( );
  const insets = useSafeAreaInsets( );
  // Explicit sizes because Image otherwise takes its height from the source's
  // pixel size, which beats aspectRatio
  const { width } = useWindowDimensions( );
  // On tall screens the top collage grows past full width so it still
  // reaches the top, cropping its sides instead
  const [topCollageHeight, setTopCollageHeight] = useState( 0 );
  const topImageHeight = Math.max(
    width * COLLAGE_TOP_RATIO,
    topCollageHeight,
  );
  const {
    stepId, proceedToNext, logIn, learnMore,
  } = useOnboardingFlow( );

  return (
    <ScreenShell
      style={{ paddingTop: insets.top, paddingBottom: Math.max( insets.bottom, 26 ) }}
      testID={`Onboarding.${stepId}`}
    >
      <View
        className="basis-0 justify-end items-center overflow-hidden"
        style={{ flexGrow: COLLAGE_TOP_RATIO }}
        onLayout={event => setTopCollageHeight( event.nativeEvent.layout.height )}
      >
        <Image
          source={COLLAGE_TOP}
          style={{ width: topImageHeight / COLLAGE_TOP_RATIO, height: topImageHeight }}
          accessibilityIgnoresInvertColors
        />
      </View>
      <View className="items-center px-4">
        {/*
          Keeps the SVG's own height; filling the row's width lets its viewBox
          shrink the logo on narrow screens
        */}
        <INatLogo
          width="100%"
          accessible
          accessibilityRole="image"
          accessibilityLabel={t( "iNaturalist" )}
          testID={`Onboarding.${stepId}.logo`}
        />
        <Body1 className="mt-5 text-center">
          {t( "Where-your-curiosity-contributes-to-science" )}
        </Body1>
        <List2 className="mt-[9px] text-center">
          {t( "Free-non-profit-community-powered" )}
        </List2>
      </View>
      <View
        className="basis-0 overflow-hidden"
        style={{ flexGrow: COLLAGE_BOTTOM_RATIO }}
      >
        <Image
          source={COLLAGE_BOTTOM}
          style={{ width, height: width * COLLAGE_BOTTOM_RATIO }}
          accessibilityIgnoresInvertColors
        />
        {/* Drawn over the whole container so it still ends in white when cropped */}
        <LinearGradient
          colors={["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"]}
          locations={[0.08, 1]}
          className="absolute w-full h-full"
        />
      </View>
      <View className="px-4 pt-[17px]">
        <Body3 className="self-center w-[274px] text-center">
          <Trans
            i18nKey="By-continuing-you-agree-to-our-Terms-of-Use-and-Privacy-Policy-Learn-More"
            components={[
              <Text
                key="0"
                className={classnames( "underline", tailwindFontBold )}
                accessibilityRole="link"
                onPress={learnMore}
                testID={`Onboarding.${stepId}.learnMore`}
              />,
            ]}
          />
        </Body3>
        <View className="mt-5 gap-[17px]">
          <Button
            level="focus"
            text={t( "GET-STARTED" )}
            onPress={proceedToNext}
            style={getShadow( )}
            testID={`Onboarding.${stepId}.next`}
          />
          <Button
            level="neutral"
            className="border-0"
            text={t( "I-ALREADY-HAVE-AN-ACCOUNT" )}
            onPress={logIn}
            style={getShadow( )}
            testID={`Onboarding.${stepId}.logIn`}
          />
        </View>
      </View>
    </ScreenShell>
  );
};

export default WelcomeStep;
