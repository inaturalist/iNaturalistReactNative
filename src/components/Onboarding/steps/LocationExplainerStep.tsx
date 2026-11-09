import { useFocusEffect, useNavigation } from "@react-navigation/native";
import OnboardingStepLayout from "components/Onboarding/OnboardingStepLayout";
import useOnboardingFlow from "components/Onboarding/useOnboardingFlow";
import Button from "components/SharedComponents/Buttons/Button";
import INatIcon from "components/SharedComponents/INatIcon";
import Body2 from "components/SharedComponents/Typography/Body2";
import Heading1 from "components/SharedComponents/Typography/Heading1";
import { Image, View } from "components/styledComponents";
import LocationIndicatorIcon from "images/svg/location_indicator_onboarding.svg";
import React, { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { requestMultiple } from "react-native-permissions";
import Animated, { Easing, FadeIn } from "react-native-reanimated";
import { log } from "sharedHelpers/logger";
import { LOCATION_PERMISSIONS } from "sharedHelpers/permissions";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

const logger = log.extend( "LocationExplainerStep" );

const MAP_IMAGE_SIZE = { width: 1344, height: 644 };
const MAP_HEIGHT = 256;
const MAP_WIDTH = ( MAP_HEIGHT * MAP_IMAGE_SIZE.width ) / MAP_IMAGE_SIZE.height;
const PIN_SIZE = 41;
const PIN_FADE_DURATION = 500;
const BULLET = "\u2022";

// inline style instead of className: Animated.View doesn't pick up
// nativewind 4 classNames
const PIN_STYLE = { position: "absolute", left: "50%" } as const;
const USER_LOCATION_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 3,
} as const;

// Offsets from the map's center, so pins stay put however much a narrow
// screen crops the sides
const PINS = [
  { centerOffset: -82.5, top: 113, delay: 0 },
  { centerOffset: -34.5, top: 25, delay: 84 },
  { centerOffset: 46.5, top: 173, delay: 170 },
  { centerOffset: -15.5, top: 189, delay: 240 },
  { centerOffset: 69.5, top: 117, delay: 308 },
  { centerOffset: 14.5, top: 66, delay: 366 },
];

const LocationMap = ( ) => (
  <View
    className="-mx-[22px] mt-[49px] mb-[41px] overflow-hidden"
    style={{ height: MAP_HEIGHT }}
  >
    <Image
      source={require( "images/onboarding/location_map.png" )}
      className="self-center"
      style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
      accessibilityIgnoresInvertColors
    />
    {PINS.map( ( { centerOffset, top, delay } ) => (
      <Animated.View
        key={`${centerOffset},${top}`}
        entering={FadeIn
          .delay( delay )
          .duration( PIN_FADE_DURATION )
          .easing( Easing.out( Easing.ease ) )}
        style={[PIN_STYLE, { marginLeft: centerOffset - PIN_SIZE / 2, top }]}
      >
        <LocationIndicatorIcon width={PIN_SIZE} height={PIN_SIZE} />
      </Animated.View>
    ) )}
    <View
      className={
        "absolute left-1/2 -ml-[9px] top-[119px] h-[17px] w-[17px] rounded-full "
        + "border-[3px] border-white bg-[#007AFF]"
      }
      style={USER_LOCATION_SHADOW}
    />
  </View>
);

const Bullet = ( { text }: { text: string } ) => (
  <View className="flex-row">
    <Body2
      className="w-[22px] text-center"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      {BULLET}
    </Body2>
    <Body2 className="flex-1">{text}</Body2>
  </View>
);

const Reason = ( { text }: { text: string } ) => (
  <View className="flex-row items-start">
    <View accessibilityElementsHidden importantForAccessibility="no">
      <INatIcon name="checkmark-circle" size={19} color={colors.inatGreen} />
    </View>
    <Body2 className="ml-3 flex-1">{text}</Body2>
  </View>
);

const LocationExplainerStep = ( ) => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const { stepId, proceedToNext } = useOnboardingFlow( );
  const [requesting, setRequesting] = useState( false );

  useFocusEffect(
    useCallback( ( ) => {
      // Swallow back while there's an earlier step; with none, let Android exit
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        ( ) => navigation.canGoBack( ),
      );
      return ( ) => backHandler.remove( );
    }, [navigation] ),
  );

  const requestLocationAndContinue = async ( ) => {
    setRequesting( true );
    try {
      await requestMultiple( LOCATION_PERMISSIONS );
    } catch ( requestError ) {
      logger.error( "Location permission request failed", requestError );
    }
    proceedToNext( );
  };

  return (
    <OnboardingStepLayout
      footer={(
        <Button
          level="focus"
          text={t( "CONTINUE" )}
          onPress={requestLocationAndContinue}
          disabled={requesting}
          loading={requesting}
          testID={`Onboarding.${stepId}.next`}
        />
      )}
    >
      <Heading1 className="mt-[44px] mb-3">
        {t( "iNaturalist-helps-you-discover-your-local-nature" )}
      </Heading1>
      <Body2 className="mb-3">{t( "Location-permissions--onboarding" )}</Body2>
      <View className="gap-3 px-[10px]">
        <Reason text={t( "Help-you-find-species-nearby" )} />
        <Reason text={t( "Quality-data-and-good-identifications" )} />
        <Reason text={t( "Helps-with-science-and-community" )} />
      </View>
      <LocationMap />
      <Body2>{t( "Just-so-you-know" )}</Body2>
      <Bullet text={t( "We-only-use-this-for-observations-you-upload-to-iNaturalist" )} />
      <Bullet text={t( "We-dont-sell-your-data" )} />
      <Bullet text={t( "You-can-adjust-your-location-privacy-on-every-observation" )} />
    </OnboardingStepLayout>
  );
};

export default LocationExplainerStep;
