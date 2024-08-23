// @flow

import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import MasonryLayout from "components/ObsDetails/MasonryLayout";
import { ActivityIndicator } from "components/SharedComponents";
import {
  Image, Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Dimensions, StatusBar } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Carousel from "react-native-reanimated-carousel";
import Photo from "realmModels/Photo";

type Props = {
  loading: boolean,
  onChangeIndex?: Function,
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  tablet: boolean
}

const TaxonMedia = ( {
  loading,
  onChangeIndex,
  photos = [],
  sounds = [],
  tablet
}: Props ): Node => {
  const { width } = Dimensions.get( "window" );
  const [index, setIndex] = useState( 0 );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const items = useMemo( ( ) => ( [...photos, ...sounds] ), [photos, sounds] );

  const CarouselSlide = useCallback(
    ( { item } ) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => { setMediaViewerVisible( true ); }}
        accessibilityState={{ disabled: false }}
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
            uri: Photo.displayLargePhoto( item.url )
          }}
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    ),
    [setMediaViewerVisible]
  );

  useEffect( ( ) => {
    if ( onChangeIndex ) {
      onChangeIndex( index );
    }
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
          loop={false}
          horizontal
          width={width}
          height={420}
          scrollAnimationDuration={100}
          data={items}
          renderItem={CarouselSlide}
          pagingEnabled
          onProgressChange={( _, absoluteProgress ) => {
            setIndex( Math.round( absoluteProgress ) );
          }}
        />
      )
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
      {/* <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
        className="absolute w-full h-[420px] z-10"
      /> */}
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
