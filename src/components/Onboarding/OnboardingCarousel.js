import {
  Body1,
  Button,
  Heading1,
  Heading4,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import INatLogo from "images/svg/inat_logo_onboarding.svg";
import OnBoardingIcon1 from "images/svg/onboarding_icon_1.svg";
import OnBoardingIcon2 from "images/svg/onboarding_icon_2.svg";
import OnBoardingIcon3 from "images/svg/onboarding_icon_3.svg";
import React, {
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StatusBar, useWindowDimensions, View
} from "react-native";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import colors from "styles/tailwindColors";

const SlideItem = props => {
  const {
    item
  } = props;
  const Icon = item.icon;

  return (
    <Animated.View className="w-full h-full">
      <View className="flex flex-col items-center w-full justify-end h-full pl-4 pr-4">
        <Icon
          width={item.iconProps.width}
          height={item.iconProps.height}
        />
        <Heading1 className="text-white mt-[30px]">
          {item.title}
        </Heading1>
        <Body1 className="text-center text-white mt-[20px]">
          {item.text}
        </Body1>
      </View>
    </Animated.View>
  );
};

const OnboardingCarousel = ( { closeModal } ) => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation( );
  const carouselRef = useRef( null );
  const progress = useSharedValue( 0 );
  const [currentIndex, setCurrentIndex] = useState( 0 );

  const paginationColor = colors.white;
  const ONBOARDING_SLIDES = [
    {
      icon: OnBoardingIcon1,
      iconProps: { width: 70, height: 70 },
      title: t( "Connect-to-Nature" ),
      text: t( "Identify-record-learn" ),
      background: require( "images/background/onboarding_bg1.jpeg" ),
      backgroundAnimation: useAnimatedStyle( () => {
        const opacity = interpolate(
          progress.value,
          [-1, 0, 1], // Fade in/out around current index
          [0, 1, 0] // Opacity transitions
        );
        return { opacity };
      } )
    },
    {
      icon: OnBoardingIcon2,
      iconProps: { width: 100, height: 100 },
      title: t( "Community-based" ),
      text: t( "iNat-is-global-community" ),
      background: require( "images/background/onboarding_bg2.jpeg" ),
      backgroundAnimation: useAnimatedStyle( () => {
        const opacity = interpolate(
          progress.value,
          [0, 1, 2], // Fade in/out around current index
          [0, 1, 0] // Opacity transitions
        );
        return { opacity };
      } )
    },
    {
      icon: OnBoardingIcon3,
      iconProps: { width: 70, height: 70 },
      title: t( "Contribute-to-Science" ),
      text: t( "Observations-on-iNat-are-cited" ),
      background: require( "images/background/onboarding_bg3.jpeg" ),
      backgroundAnimation: useAnimatedStyle( () => {
        const opacity = interpolate(
          progress.value,
          [1, 2, 3], // Fade in/out around current index
          [0, 1, 0] // Opacity transitions
        );
        return { opacity };
      } )
    }
  ];

  const renderItem = ( { style, index, item } ) => (
    <SlideItem
      key={`OnboardingCarouselSlide-${item.title}`}
      index={index}
      style={style}
      item={item}
    />
  );

  return (
    <ViewWrapper wrapperClassName="bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View
        className="w-full h-full relative"
      >
        <View className="absolute w-full h-full ">
          {ONBOARDING_SLIDES.map( item => (
            <Animated.View
              key={`OnboardingCarouselBackground-${item.title}`}
              className="absolute w-full h-full"
              style={item.backgroundAnimation}
            >
              <Image
                source={item.background}
                className="h-full w-full"
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
          ) )}
        </View>
        <View
          className="flex flex-col w-full h-full items-center"
          style={
            // Semi-transparent background tailwind class not working here
            // eslint-disable-next-line react-native/no-inline-styles
            { backgroundColor: "rgba(0,0,0,0.6)" }
          }
        >
          <INatIconButton
            icon="close"
            color={colors.white}
            size={19}
            className="absolute z-10 top-[15px] right-[10px]"
            onPress={( ) => closeModal( )}
            accessibilityLabel={t( "Close" )}
            accessibilityHint={t( "Closes-new-observation-options" )}
          />
          <View pointerEvents="none" className="items-center absolute top-[82px]">
            <INatLogo
              width={270}
              height={49}
            />
            <Heading4 className="text-white mt-[15px]">{t( "CONNECT-TO-NATURE" )}</Heading4>
          </View>

          <View className="w-full flex-1">
            <Carousel
              ref={carouselRef}
              className="w-full h-full pb-[120px]"
              data={ONBOARDING_SLIDES}
              width={width}
              loop={false}
              scrollAnimationDuration={400}
              onProgressChange={( offsetProgress, absoluteProgress ) => {
                setCurrentIndex( Math.round( absoluteProgress ) );
                progress.value = absoluteProgress;
              }}
              onScrollEnd={() => {
                setCurrentIndex( carouselRef.current?.getCurrentIndex() );
              }}
              renderItem={renderItem}
            />
          </View>

          <View className="absolute bottom-0 w-full" pointerEvents="box-none">
            <View className="pt-8">
              <View
                className="flex w-full justify-evenly items-center"
              >
                <AnimatedDotsCarousel
                  length={ONBOARDING_SLIDES.length}
                  currentIndex={currentIndex}
                  maxIndicators={ONBOARDING_SLIDES.length}
                  interpolateOpacityAndColor={false}
                  activeIndicatorConfig={{
                    color: paginationColor,
                    margin: 2.5,
                    opacity: 1,
                    size: 6
                  }}
                  inactiveIndicatorConfig={{
                    color: paginationColor,
                    margin: 2.5,
                    opacity: 1,
                    size: 3
                  }}
                  // required by the component although we don't need it.
                  // Size of decreasing dots set to the same
                  decreasingDots={[
                    {
                      config: {
                        color: paginationColor, margin: 3, opacity: 0.5, size: 6
                      },
                      quantity: 1
                    },
                    {
                      config: {
                        color: paginationColor, margin: 3, opacity: 0.5, size: 3
                      },
                      quantity: 1
                    }
                  ]}
                />
              </View>
            </View>
            <View
              className="mt-[25px] mb-[23px] pl-[15px] pr-[15px] flex flex-col items-center w-full"
            >
              <Button
                className="w-full"
                level="primary"
                forceDark
                text={t( "CONTINUE" )}
                onPress={() => (
                  carouselRef.current?.getCurrentIndex() >= ONBOARDING_SLIDES.length - 1
                    ? closeModal()
                    : carouselRef.current?.scrollTo( { count: 1, animated: true } ) )}
              />
            </View>
          </View>
        </View>
      </View>
    </ViewWrapper>
  );
};

export default OnboardingCarousel;
