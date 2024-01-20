// @flow

import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { Dimensions, StatusBar } from "react-native";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Carousel from "react-native-reanimated-carousel";
import colors from "styles/tailwindColors";

import PhotoSlide from "./PhotoSlide";
import SoundSlide from "./SoundSlide";

type Props = {
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  sounds: Array<{
    id: number,
    file_url: string,
  }>
}

const ObsMediaCarousel = ( {
  photos = [],
  sounds = []
}: Props ): Node => {
  const { width } = Dimensions.get( "window" );
  const [index, setIndex] = useState<number>( 0 );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const paginationColor = colors.white;

  const CarouselSlide = useCallback( ( { item } ) => {
    if ( item.file_url ) {
      return <SoundSlide sound={item} />;
    }
    return <PhotoSlide photo={item} onPress={( ) => setMediaViewerVisible( true )} />;
  }, [setMediaViewerVisible] );

  const currentPhotoUrl = index >= photos.length
    ? undefined
    : photos[index]?.url;

  const items = [...photos, ...sounds];

  return (
    <View className="relative">
      <StatusBar hidden={mediaViewerVisible} />
      <Carousel
        testID="photo-scroll"
        loop={false}
        horizontal
        width={width}
        height={288}
        scrollAnimationDuration={100}
        data={items}
        renderItem={CarouselSlide}
        pagingEnabled
        onProgressChange={( _, absoluteProgress ) => {
          setIndex( Math.round( absoluteProgress ) );
        }}
      />
      {items.length > 1 && (
        <View
          className="flex absolute bottom-0 w-full justify-evenly items-center p-[15px]"
        >
          <AnimatedDotsCarousel
            length={items.length}
            currentIndex={index}
            maxIndicators={items.length}
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
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        uri={currentPhotoUrl}
        photos={photos}
      />
    </View>
  );
};

export default ObsMediaCarousel;
