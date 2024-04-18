// @flow

import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, StatusBar } from "react-native";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Carousel from "react-native-reanimated-carousel";
import colors from "styles/tailwindColors";

import MasonryLayout from "./MasonryLayout";
import PhotoContainer from "./PhotoContainer";
import SoundContainer from "./SoundContainer";

type Props = {
  loading: boolean,
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  sounds?: Array<{
    file_url: string
  }>,
  tablet: boolean
}

const ObsMedia = ( {
  loading,
  photos = [],
  sounds = [],
  tablet
}: Props ): Node => {
  const { width } = Dimensions.get( "window" );
  const [index, setIndex] = useState<number>( 0 );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const paginationColor = colors.white;

  const items = useMemo( ( ) => ( [...photos, ...sounds] ), [photos, sounds] );

  const CarouselSlide = useCallback(
    ( { item } ) => ( item.file_url
      ? (
        <SoundContainer
          sizeClass="h-72 w-screen"
          sound={item}
          isVisible={items.indexOf( item ) === index}
        />
      )
      : (
        <PhotoContainer photo={item} onPress={() => setMediaViewerVisible( true )} />
      ) ),
    [setMediaViewerVisible, items, index]
  );

  const currentPhotoUrl = index >= photos.length
    ? undefined
    : photos[index]?.url;

  const loadingIndicator = (
    <View className="h-[288px] w-full items-center justify-center">
      <ActivityIndicator
        className="absolute"
      />
    </View>
  );

  const renderPhone = ( ) => (
    <>
      {loading
        ? loadingIndicator
        : (
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
        )}
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
    </>
  );

  const renderTablet = () => (
    <View className="w-full h-full">
      <MasonryLayout
        items={items}
        onImagePress={newIndex => {
          setIndex( newIndex );
          setMediaViewerVisible( true );
        }}
      />
    </View>
  );

  return (
    <View className="relative">
      <StatusBar hidden={mediaViewerVisible} />
      {!tablet
        ? renderPhone( )
        : renderTablet( )}
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        uri={currentPhotoUrl}
        photos={photos}
        sounds={sounds}
      />
    </View>
  );
};

export default ObsMedia;
