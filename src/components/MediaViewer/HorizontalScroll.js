// @flow

import DeletePhotoDialog from "components/SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "tailwindcss/colors";

import Photo from "../../models/Photo";
import CustomImageZoom from "./CustomImageZoom";

type Props = {
  photoUris: Array<string>,
  initialPhotoSelected: number,
  deleteDialogVisible: boolean,
  setPhotoUris: Function,
  hideDialog: Function
}

const { width } = Dimensions.get( "screen" );

const HorizontalScroll = ( {
  photoUris, initialPhotoSelected, deleteDialogVisible, setPhotoUris, hideDialog
}: Props ): Node => {
  const horizontalScroll = useRef( null );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( initialPhotoSelected );

  const FIRST_PHOTO = selectedPhotoIndex === 0;
  const LAST_PHOTO = selectedPhotoIndex === photoUris.length - 1;

  const scrollToIndex = index => {
    // when a user taps a photo in the carousel, the UI needs to automatically
    // scroll to the index of the photo they selected
    if ( !horizontalScroll?.current ) { return; }
    setSelectedPhotoIndex( index );
    horizontalScroll?.current.scrollToIndex( { index, animated: true } );
  };

  const renderImage = ( { item } ) => (
    <CustomImageZoom source={{ uri: Photo.displayLargePhoto( item ) }} />
  );

  // need getItemLayout for setting initial scroll index
  const getItemLayout = ( data, index ) => ( {
    length: width,
    offset: width * index,
    index
  } );

  const handleScrollLeft = index => {
    if ( FIRST_PHOTO ) { return; }
    setSelectedPhotoIndex( index );
  };

  const handleScrollRight = index => {
    if ( LAST_PHOTO ) { return; }
    setSelectedPhotoIndex( index );
  };

  const handleScrollEndDrag = e => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = width * selectedPhotoIndex;

    // https://gist.github.com/dozsolti/6d01d0f96d9abced3450a2e6149a2bc3?permalink_comment_id=4107663#gistcomment-4107663
    const index = Math.floor(
      Math.floor( x ) / Math.floor( layoutMeasurement.width )
    );

    if ( x > currentOffset ) {
      handleScrollRight( index );
    } else if ( x < currentOffset ) {
      handleScrollLeft( index );
    }
  };

  const handleArrowPressLeft = ( ) => {
    if ( FIRST_PHOTO ) { return; }
    scrollToIndex( selectedPhotoIndex - 1 );
  };

  const handleArrowPressRight = ( ) => {
    if ( LAST_PHOTO ) { return; }
    scrollToIndex( selectedPhotoIndex + 1 );
  };

  return (
    <>
      <FlatList
        data={photoUris}
        renderItem={renderImage}
        initialScrollIndex={selectedPhotoIndex}
        getItemLayout={getItemLayout}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // $FlowIgnore
        ref={horizontalScroll}
        onMomentumScrollEnd={handleScrollEndDrag}
      />
      {!FIRST_PHOTO && (
        <Pressable
          className="p-5 absolute top-1/2 -mt-24 left-0"
          onPress={handleArrowPressLeft}
        >
          <Icon name="arrow-back-ios" color={colors.white} size={16} />
        </Pressable>
      )}
      {!LAST_PHOTO && (
        <Pressable
          className="p-5 absolute top-1/2 -mt-24 right-0"
          onPress={handleArrowPressRight}
        >
          <Icon name="arrow-forward-ios" color={colors.white} size={16} />
        </Pressable>
      )}
      <PhotoCarousel
        photoUris={photoUris}
        selectedPhotoIndex={selectedPhotoIndex}
        setSelectedPhotoIndex={scrollToIndex}
      />
      <DeletePhotoDialog
        deleteDialogVisible={deleteDialogVisible}
        photoUriToDelete={photoUris[selectedPhotoIndex]}
        photoUris={photoUris}
        setPhotoUris={setPhotoUris}
        hideDialog={hideDialog}
      />
    </>
  );
};

export default HorizontalScroll;
