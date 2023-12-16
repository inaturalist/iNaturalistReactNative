// @flow

import {
  TransparentCircleButton
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import Photo from "realmModels/Photo";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import AttributionButton from "./AttributionButton";
import CustomImageZoom from "./CustomImageZoom";

type Props = {
  editable?: boolean,
  horizontalScroll: any,
  onDelete?: Function,
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  selectedPhotoIndex: number,
  setSelectedPhotoIndex: Function
}

const MainPhotoDisplay = ( {
  editable,
  horizontalScroll,
  onDelete = ( ) => { },
  photos,
  selectedPhotoIndex,
  setSelectedPhotoIndex
}: Props ): Node => {
  const { t } = useTranslation( );
  const { screenWidth } = useDeviceOrientation( );
  const [displayHeight, setDisplayHeight] = useState( 0 );
  const [zooming, setZooming] = useState( false );
  const atFirstPhoto = selectedPhotoIndex === 0;
  const atLastPhoto = selectedPhotoIndex === photos.length - 1;

  const renderImage = useCallback( ( { item: photo } ) => (
    <View>
      <CustomImageZoom
        source={{ uri: Photo.displayLargePhoto( photo.url || photo.localFilePath ) }}
        height={displayHeight}
        setZooming={setZooming}
      />
      {
        editable
          ? (
            <View className="absolute bottom-4 right-4">
              <TransparentCircleButton
                onPress={onDelete}
                icon="trash-outline"
                color={colors.white}
                accessibilityLabel={t( "Delete-photo" )}
              />
            </View>
          )
          : (
            <AttributionButton
              licenseCode={photo.licenseCode}
              attribution={photo.attribution}
              optionalClasses="absolute top-4 right-4"
            />
          )
      }
    </View>
  ), [
    displayHeight,
    editable,
    onDelete,
    t
  ] );

  // need getItemLayout for setting initial scroll index
  const getItemLayout = useCallback( ( data, idx ) => ( {
    length: screenWidth,
    offset: screenWidth * idx,
    index: idx
  } ), [screenWidth] );

  const handleScrollLeft = useCallback( index => {
    if ( atFirstPhoto ) { return; }
    setSelectedPhotoIndex( index );
  }, [atFirstPhoto, setSelectedPhotoIndex] );

  const handleScrollRight = useCallback( index => {
    if ( atLastPhoto ) { return; }
    setSelectedPhotoIndex( index );
  }, [atLastPhoto, setSelectedPhotoIndex] );

  const handleScrollEndDrag = useCallback( e => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = screenWidth * selectedPhotoIndex;

    // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
    const index = Math.floor(
      Math.floor( x ) / Math.floor( layoutMeasurement.width )
    );

    if ( x > currentOffset ) {
      handleScrollRight( index );
    } else if ( x < currentOffset ) {
      handleScrollLeft( index );
    }
  }, [
    handleScrollLeft,
    handleScrollRight,
    screenWidth,
    selectedPhotoIndex
  ] );

  return (
    <View
      className="flex-1"
      onLayout={event => {
        const { height } = event.nativeEvent.layout;
        setDisplayHeight( height );
      }}
    >
      <FlatList
        data={photos}
        renderItem={renderImage}
        initialScrollIndex={selectedPhotoIndex}
        getItemLayout={getItemLayout}
        horizontal
        pagingEnabled
        // Disable scrolling when image is zooming
        scrollEnabled={!zooming}
        showsHorizontalScrollIndicator={false}
        ref={horizontalScroll}
        onMomentumScrollEnd={handleScrollEndDrag}
      />
    </View>
  );
};

export default MainPhotoDisplay;
