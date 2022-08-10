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
    if ( !horizontalScroll?.current ) { return; }
    horizontalScroll?.current.scrollToIndex( { index, animated: true } );
  };

  const handlePhotoSelection = index => {
    setSelectedPhotoIndex( index );
    scrollToIndex( index );
  };

  const viewConfigRef = useRef( {
    waitForInteraction: true,
    viewAreaCoveragePercentThreshold: 95
  } );

  const onViewRef = useRef( ( { changed } ) => {
    const { index } = changed[0];
    if ( index === null || index === undefined ) { return; }
    // when a user scrolls left or right, update the selected photo in the photo carousel
    setSelectedPhotoIndex( index );
    // setCurrentIndex( index );
  } );

  const renderImage = ( { item } ) => (
    <CustomImageZoom source={{ uri: Photo.displayLargePhoto( item ) }} />
  );

  // need getItemLayout for setting initial scroll index
  const getItemLayout = ( data, index ) => ( {
    length: width,
    offset: width * index,
    index
  } );

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
        viewabilityConfig={viewConfigRef.current}
        onViewableItemsChanged={onViewRef.current}
      />
      <PhotoCarousel
        photoUris={photoUris}
        selectedPhotoIndex={selectedPhotoIndex}
        setSelectedPhotoIndex={handlePhotoSelection}
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
