// @flow

import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList } from "react-native";

import Photo from "../../models/Photo";
import DeletePhotoDialog from "../SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
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

  const handleScrollLeft = ( ) => {
    if ( selectedPhotoIndex === 0 ) { return; }
    setSelectedPhotoIndex( selectedPhotoIndex - 1 );
  };

  const handleScrollRight = ( ) => {
    if ( selectedPhotoIndex === photoUris.length - 1 ) { return; }
    setSelectedPhotoIndex( selectedPhotoIndex + 1 );
  };

  const handleScrollEndDrag = e => {
    const { contentOffset } = e.nativeEvent;
    const { x } = contentOffset;

    const currentOffset = width * selectedPhotoIndex;

    if ( x > currentOffset ) {
      handleScrollRight( );
    } else if ( x < currentOffset ) {
      handleScrollLeft( );
    }
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
        // https://stackoverflow.com/questions/43370807/react-native-get-current-page-in-flatlist-when-using-pagingenabled
        onMomentumScrollEnd={handleScrollEndDrag}
      />
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
