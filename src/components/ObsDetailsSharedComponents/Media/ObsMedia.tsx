import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import MasonryLayout from "components/ObsDetails/MasonryLayout";
import type { MediaPhotoItem } from "components/ObsDetailsSharedComponents/Media/PhotoContainer";
import PhotoContainer from "components/ObsDetailsSharedComponents/Media/PhotoContainer";
import type { MediaSoundItem } from "components/ObsDetailsSharedComponents/Media/SoundContainer";
import SoundContainer from "components/ObsDetailsSharedComponents/Media/SoundContainer";
import { ActivityIndicator, Carousel, CarouselDots } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo, useState } from "react";
import type { ListRenderItem } from "react-native";

type ObsMediaItem = MediaPhotoItem | MediaSoundItem;

const isSound = ( item: ObsMediaItem ): item is MediaSoundItem => "file_url" in item;

interface Props {
  loading: boolean;
  photos: MediaPhotoItem[];
  sounds?: MediaSoundItem[];
  tablet?: boolean;
}

const ObsMedia = ( {
  loading,
  photos = [],
  sounds = [],
  tablet = false,
}: Props ) => {
  const [index, setIndex] = useState( 0 );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const items = useMemo<ObsMediaItem[]>( ( ) => ( [...photos, ...sounds] ), [photos, sounds] );

  const CarouselSlide: ListRenderItem<ObsMediaItem> = useCallback(
    ( { item } ) => ( isSound( item )
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
