// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { View } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import { viewStyles } from "../../styles/photoLibrary/photoGalleryHeader";
import usePhotoAlbums from "./hooks/usePhotoAlbums";

type Props = {
  updateAlbum: Function
}

const PhotoGalleryHeader = ( { updateAlbum }: Props ): Node => {
  const navigation = useNavigation( );

  const changeAlbum = newAlbum => {
    updateAlbum( newAlbum !== "All" ? newAlbum : null );
  };

  const albums = usePhotoAlbums( );

  const placeholder = {};

  // TODO: make this navigation go back to whatever screen the user
  // was on last, not ObsList every time
  const navBack = ( ) => navigation.goBack( );

  return (
    <View style={viewStyles.header}>
      <HeaderBackButton onPress={navBack} />
      <RNPickerSelect
        hideIcon
        items={albums}
        onValueChange={changeAlbum}
        placeholder={placeholder}
        useNativeAndroidPickerStyle={false}
        disabled={albums.length <= 1}
        style={viewStyles}
      />
    </View>
  );
};

export default PhotoGalleryHeader;
