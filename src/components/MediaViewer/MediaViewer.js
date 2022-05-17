// @flow

import React, { useState, useRef } from "react";
import { Image, Dimensions, FlatList } from "react-native";
import type { Node } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Appbar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";

import { imageStyles, viewStyles } from "../../styles/mediaViewer/mediaViewer";
import Photo from "../../models/Photo";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import PhotoDeleteDialog from "./PhotoDeleteDialog";

const { width } = Dimensions.get( "screen" );

const MediaViewer = ( ): Node => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { photos, mainPhoto } = params;
  const [selectedPhoto, setSelectedPhoto] = useState( mainPhoto );

  const { t } = useTranslation( );
  const flatList = useRef( null );

  const renderItem = ( { item, index } ) => {
    const uri = Photo.setPlatformSpecificFilePath( photos[index].path );
    return <Image source={{ uri }} style={imageStyles.selectedPhoto} />;
  };

  const handleScroll = ( { nativeEvent } ) => {
    // this updates main photo based on main view scroll left or right
    const { x } = nativeEvent.contentOffset;
    const index = Math.round( x / width );
    setSelectedPhoto( index );
  };

  const handleSelectedPhoto = ( index ) => {
    // this updates main photo when user taps to select a carousel photo
    if ( flatList && flatList.current !== null ) {
      flatList.current.scrollToIndex( { index, animated: true } );
    }
  };

  const getItemLayout = ( data, index ) => ( {
    length: ( width ),
    offset: ( width ) * index,
    index
  } );

  const photo = Photo.setPlatformSpecificFilePath( photos[selectedPhoto].path );

  return (
    <ViewNoFooter style={viewStyles.container}>
      <Appbar.Header style={viewStyles.container}>
        <Appbar.Content title={t( "X-Photos", { photoCount: photos.length } )} />
      </Appbar.Header>
      <FlatList
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
      />
      <PhotoCarousel
        photos={photos}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={handleSelectedPhoto}
      />
      <HeaderBackButton onPress={( ) => navigation.goBack( )} />
      <PhotoDeleteDialog photo={photo} />
      {/* <Button style={viewStyles.alignRight}>{t( "Remove-Photo" )}</Button> */}
    </ViewNoFooter>
  );
};

export default MediaViewer;
