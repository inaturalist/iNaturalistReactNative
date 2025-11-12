import {
  Body1,
  Button,
  Heading1,
  Heading4,
  INatIcon,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import { ImageBackground } from "components/styledComponents";
import INatLogo from "images/svg/inat_logo_onboarding.svg";
import OnBoardingIcon2 from "images/svg/onboarding_icon_2.svg";
import OnBoardingIcon3 from "images/svg/onboarding_icon_3.svg";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  StatusBar,
  useWindowDimensions,
  View
} from "react-native";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useOnboardingShown } from "sharedHelpers/installData";
import { logFirebaseEvent } from "sharedHelpers/tracking";
import colors from "styles/tailwindColors";

const SlideItem = props => {
  const {
    item, index
  } = props;
  const Icon = item.icon;

  return (
    <Animated.View className="w-full h-full">
      <View className="flex flex-col items-center w-full justify-end h-full pl-4 pr-4">
        {index === 0
          ? (
            <INatIcon
              name="aicamera"
              size={71}
              color={colors.white}
            />
          )
          : (
            <Icon
              width={item.iconProps.width}
              height={item.iconProps.height}
            />
          )}
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

const OnboardingCarousel = ( ) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [onboardingShown, setOnboardingShown] = useOnboardingShown();
  const { width } = useWindowDimensions();
  const { t } = useTranslation( );
  const carouselRef = useRef( null );
  const progress = useSharedValue( 0 );
  const [currentIndex, setCurrentIndex] = useState( 0 );
  const [imagesLoaded, setImagesLoaded] = useState( false );

  const closeModal = () => {
    logFirebaseEvent( "onboarding_close_pressed", { currentIndex } );
    setOnboardingShown( true );
  };

  const paginationColor = colors.white;
  const backgroundAnimation1 = useAnimatedStyle( () => {
    const opacity = interpolate(
      progress.get(),
      [-1, 0, 1], // Fade in/out around current index
      [0, 1, 0] // Opacity transitions
    );
    return { opacity };
  } );

  const backgroundAnimation2 = useAnimatedStyle( () => {
    const opacity = interpolate(
      progress.get(),
      [0, 1, 2], // Fade in/out around current index
      [0, 1, 0] // Opacity transitions
    );
    return { opacity };
  } );

  const backgroundAnimation3 = useAnimatedStyle( () => {
    const opacity = interpolate(
      progress.get(),
      [1, 2, 3], // Fade in/out around current index
      [0, 1, 0] // Opacity transitions
    );
    return { opacity };
  } );

  const ONBOARDING_SLIDES = useMemo( ( ) => ( [
    {
      icon: null,
      iconProps: { width: 70, height: 70 },
      title: t( "Identify-species-anywhere" ),
      text: t( "Get-an-instant-ID-of-any-plant-animal-fungus" ),
      background: require( "images/background/karsten-winegeart-RAgWH6ldps0-unsplash-cropped.jpg" ),
      backgroundAnimation: backgroundAnimation1
    },
    {
      icon: OnBoardingIcon2,
      iconProps: { width: 100, height: 100 },
      title: t( "Connect-with-expert-naturalists" ),
      text: t( "Experts-help-verify-and-improve-IDs" ),
      background: require( "images/background/shane-rounce-DNkoNXQti3c-unsplash.jpg" ),
      backgroundAnimation: backgroundAnimation2
    },
    {
      icon: OnBoardingIcon3,
      iconProps: { width: 70, height: 70 },
      title: t( "Help-protect-species" ),
      text: t( "Verified-IDs-are-used-for-science-and-conservation" ),
      background: require( "images/background/sk-yeong-cXpdNdqp7eY-unsplash.jpg" ),
      backgroundAnimation: backgroundAnimation3
    }
  ] ), [backgroundAnimation1, backgroundAnimation2, backgroundAnimation3, t] );

  const renderItem = ( { style, index, item } ) => (
    <SlideItem
      key={`OnboardingCarouselSlide-${item.title}`}
      index={index}
      style={style}
      item={item}
    />
  );

  const totalImages = ONBOARDING_SLIDES.length;

  // Preload images; show splash screen in meantime
  useEffect( () => {
    const imageSources = ONBOARDING_SLIDES.map( slide => slide.background );

    let loadedCount = 0;

    // Preload each image
    imageSources.forEach( source => {
      Image.prefetch( Image.resolveAssetSource( source ).uri )
        .then( ( ) => {
          loadedCount += 1;
          if ( loadedCount === totalImages ) {
            setTimeout( ( ) => {
              setImagesLoaded( true );
            }, 500 );
          }
        } )
        .catch( error => console.error( "Error loading image:", error ) );
    } );
  }, [ONBOARDING_SLIDES, totalImages] );

  // TODO: On Android release build imagesLoaded never switched from false to true, and
  // this screen was stuck in a loading state. On iOS it worked as expected.
  // Disabling it now on Android to make a new release possible.
  if ( Platform.OS === "android"
    ? false
    : !imagesLoaded ) {
    return (
      <ImageBackground
        source={require( "images/background/daniel-olah-YNUFtf4qyh0-unsplash.jpg" )}
        className="flex-1 items-center justify-center"
      >
        <INatIcon
          name="inaturalist"
          size={130}
          color={colors.white}
        />
      </ImageBackground>
    );
  }

  return (
    <ViewWrapper wrapperClassName="bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View
        className="w-full h-full relative"
        testID="OnboardingCarousel"
      >
        <View
          className="absolute w-full h-full"
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
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
            accessibilityHint={t( "Closes-introduction" )}
          />
          <View pointerEvents="none" className="items-center absolute top-[82px]">
            <INatLogo
              width={270}
              height={49}
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Heading4 className="text-white mt-[15px]">
              {t( "DISCOVER-NATURE-AROUND-YOU" )}
            </Heading4>
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
                progress.set( absoluteProgress );
              }}
              onScrollEnd={() => {
                setCurrentIndex( carouselRef.current?.getCurrentIndex() );
              }}
              renderItem={renderItem}
            />
          </View>

          <View className="absolute bottom-0 w-full" pointerEvents="box-none">
            <View
              className="pt-8"
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
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
                onPress={() => {
                  logFirebaseEvent(
                    "onboarding_continue_pressed",
                    { current_slide: currentIndex }
                  );
                  const isLastSlide = carouselRef.current?.getCurrentIndex()
                    >= ONBOARDING_SLIDES.length - 1;
                  if ( isLastSlide ) {
                    closeModal();
                  } else {
                    carouselRef.current?.scrollTo( { count: 1, animated: true } );
                  }
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </ViewWrapper>
  );
};

export default OnboardingCarousel;
