// @flow

import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import { ActivityIndicator, Carousel, CarouselDots } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";

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
  tablet,
}: Props ): Node => {
  const [index, setIndex] = useState( 0 );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

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
    [setMediaViewerVisible, items, index],
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
            data={items}
            renderItem={CarouselSlide}
            onSlideScroll={setIndex}
          />
        )}
      {items.length > 1 && (
        <View
          className="flex absolute bottom-0 w-full justify-evenly items-center p-[15px]"
        >
          <CarouselDots length={items.length} index={index} />
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
