// @flow

import { Image, View } from "components/styledComponents";
import * as React from "react";
import { Dimensions } from "react-native";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Carousel from "react-native-reanimated-carousel";
import colors from "styles/tailwindColors";

type Props = {
  photos: Array<Object>
}

const PhotoScroll = ( { photos }: Props ): React.Node => {
  const { width } = Dimensions.get( "window" );
  const [index, setIndex] = React.useState<number>( 0 );
  const paginationColor = colors.white;

  const handleIndex = number => {
    setIndex( number );
  };

  const renderImage = ( { item: photo } ) => {
    // check for local file path for unuploaded photos
    const photoUrl = ( photo && photo.url )
      ? photo.url.replace( "square", "large" )
      : photo.localFilePath;

    return (
      <View>
        <Image
          testID="PhotoScroll.photo"
          source={{ uri: photoUrl }}
          className="h-72 w-screen"
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  };

  return (
    <View className="relative" accessibilityState={{ disabled: false }}>
      <Carousel
        testID="photo-scroll"
        accessibilityState={{ disabled: false }}
        loop={false}
        horizontal
        width={width}
        height={288}
        scrollAnimationDuration={100}
        data={photos}
        renderItem={renderImage}
        pagingEnabled
        onProgressChange={( _, absoluteProgress ) => {
          handleIndex( Math.round( absoluteProgress ) );
        }}
      />
      {photos.length > 1
        && (
          <View
            className="flex absolute bottom-0 w-full justify-evenly items-center p-[15px]"
            accessibilityState={{ disabled: false }}
          >
            <AnimatedDotsCarousel
              accessibilityState={{ disabled: false }}
              length={photos.length}
              currentIndex={index}
              maxIndicators={photos.length}
              interpolateOpacityAndColor={false}
              activeIndicatorConfig={{
                color: paginationColor,
                margin: 2.5,
                opacity: 1,
                size: 4
              }}
              inactiveIndicatorConfig={{
                color: paginationColor,
                margin: 2.5,
                opacity: 1,
                size: 2
              }}
              // required by the component although we don't need it.
              // Size of decreasing dots set to the same
              decreasingDots={[
                {
                  config: {
                    color: paginationColor, margin: 3, opacity: 0.5, size: 4
                  },
                  quantity: 1
                },
                {
                  config: {
                    color: paginationColor, margin: 3, opacity: 0.5, size: 2
                  },
                  quantity: 1
                }
              ]}
            />
          </View>
        )}
    </View>

  );
};

export default PhotoScroll;
