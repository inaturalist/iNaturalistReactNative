// @flow

import React from "react";
import { useState } from "react";
import { Image } from "react-native";
import type { Node } from "react";
import { useRoute } from "@react-navigation/native";
import { Appbar } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { imageStyles } from "../../styles/mediaViewer/mediaViewer";
import Photo from "../../models/Photo";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";

const MediaViewer = ( ): Node => {
  const [selectedPhoto, setSelectedPhoto] = useState( 0 );
  const { params } = useRoute( );
  const { photos } = params;
  const { t } = useTranslation( );

  const uri = Photo.setPlatformSpecificFilePath( photos[selectedPhoto].path );

  return (
    <ViewNoFooter>
      <Appbar.Header>
        <Appbar.Content title={t( "X Photos", { numOfPhotos: photos.length } )} />
      </Appbar.Header>
      <Image source={{ uri }} style={imageStyles.selectedPhoto} />
      <PhotoCarousel
        photos={photos}
        selectedPhoto={selectedPhoto}
        setSelectedPhoto={setSelectedPhoto}
      />
    </ViewNoFooter>
  );
};

export default MediaViewer;
