// @flow

import React, { useState, useRef, useEffect } from "react";
import { Image, Dimensions, FlatList } from "react-native";
import type { Node } from "react";
import { Appbar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import ImageZoom from "react-native-image-pan-zoom";

import { imageStyles, viewStyles } from "../../styles/mediaViewer/mediaViewer";
import Photo from "../../models/Photo";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import PhotoDeleteDialog from "./PhotoDeleteDialog";

const { width, height } = Dimensions.get( "screen" );
const mainImageHeight = height - 350;

type Props = {
  photos: Array<Object>,
  setPhotos: Function,
  mainPhoto: Object,
  hideModal: Function
}

const MediaViewer = ( { photos, setPhotos, mainPhoto, hideModal }: Props ): Node => {
  const [selectedPhoto, setSelectedPhoto] = useState( mainPhoto );
  const { t } = useTranslation( );
  // const flatList = useRef( null );

  // const renderItem = ( { item, index } ) => {
  //   const uri = Photo.displayLocalOrRemotePhoto( photos[index] );
  //   return <Image style={imageStyles.selectedPhoto} source={{ uri }} />;
  // };

  // const handleScroll = ( { nativeEvent } ) => {
  //   // this updates main photo based on main view scroll left or right
  //   const { x } = nativeEvent.contentOffset;
  //   const index = Math.round( x / width );
  //   setSelectedPhoto( index );
  // };

  const handleSelectedPhoto = ( index ) => setSelectedPhoto( index );

  // const handleSelectedPhoto = ( index ) => {
  //   // this updates main photo when user taps to select a carousel photo
  //   if ( flatList && flatList.current !== null ) {
  //     flatList.current.scrollToIndex( { index, animated: true } );
  //   }
  // };

  // const getItemLayout = ( data, index ) => ( {
  //   length: ( width ),
  //   offset: ( width ) * index,
  //   index
  // } );

  useEffect( ( ) => {
    // automatically select the only photo in the media viewer
    if ( photos.length === 1 && selectedPhoto !== 0 ) {
      setSelectedPhoto( 0 );
    }
  }, [photos, selectedPhoto] );

  return (
    <ViewNoFooter style={viewStyles.container}>
      <Appbar.Header style={viewStyles.container}>
        <Appbar.Content title={t( "X-Photos", { photoCount: photos.length } )} />
      </Appbar.Header>
      {photos.length > 0 && (
        <ImageZoom
          cropWidth={width}
          cropHeight={mainImageHeight}
          imageWidth={width}
          imageHeight={mainImageHeight}
        >
          <Image
            style={imageStyles.selectedPhoto}
            source={{ uri: Photo.displayLocalOrRemotePhoto( photos[selectedPhoto] ) }}
          />
        </ImageZoom>
      )}
      {/* <FlatList
        // $FlowFixMe
        ref={flatList}
        bounces={false}
        data={photos}
        horizontal
        initialNumToRender={1}
        pagingEnabled
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        onMomentumScrollEnd={handleScroll}
        initialScrollIndex={mainPhoto}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      /> */}
      <PhotoCarousel
        photos={photos}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={handleSelectedPhoto}
      />
      <HeaderBackButton onPress={hideModal} />
      <PhotoDeleteDialog
        photo={photos[selectedPhoto]}
        photos={photos}
        setPhotos={setPhotos}
      />
    </ViewNoFooter>
  );
};

export default MediaViewer;
