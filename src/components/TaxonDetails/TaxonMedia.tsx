import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import MasonryLayout from "components/ObsDetails/MasonryLayout";
import { ActivityIndicator, Carousel } from "components/SharedComponents";
import {
  Image, Pressable, View,
} from "components/styledComponents";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ListRenderItem } from "react-native";
import { Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Photo from "realmModels/Photo";

interface PhotoItem {
  id: number;
  url: string;
  localFilePath: string;
  attribution: string;
  hidden: boolean;
  licenseCode?: string;
}

interface Props {
  loading: boolean;
  onChangeIndex: ( newIndex: number ) => void;
  photos: PhotoItem[];
  tablet: boolean;
}

const TaxonMedia = ( {
  loading,
  onChangeIndex,
  photos = [],
  tablet,
}: Props ) => {
  const { width } = Dimensions.get( "window" );
  const [index, setIndex] = useState( 0 );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const slideStyle = useMemo( ( ) => ( {
    width,
    height: 420,
  } ), [width] );

  const CarouselSlide: ListRenderItem<PhotoItem> = useCallback(
    ( { item } ) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => { setMediaViewerVisible( true ); }}
        accessibilityState={{ disabled: false }}
        style={slideStyle}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
          className="absolute w-full h-full z-10"
        />
        <Image
          testID={`TaxonDetails.photo.${item.id}`}
          className="w-full h-full"
          source={{
            // TODO replace this entire image component to one that supports
            // progressive sizes and fallbacks if the large photo isn't
            // available
            uri: Photo.displayLargePhoto( item.url ),
          }}
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    ),
    [setMediaViewerVisible, slideStyle],
  );

  useEffect( ( ) => {
    onChangeIndex( index );
  }, [index, onChangeIndex] );

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
    loading
      ? loadingIndicator
      : (
        <Carousel
          testID="photo-scroll"
          data={photos}
          renderItem={CarouselSlide}
          onSlideScroll={setIndex}
        />
      )
  );

  const renderTablet = () => (
    <View className="w-full h-full">
      <MasonryLayout
        items={photos}
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
      />
    </View>
  );
};

export default TaxonMedia;
