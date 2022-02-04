// @flow

import React from "react";
import { View, Pressable, Text } from "react-native";
import type { Node } from "react";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";

import usePhotoAlbums from "./hooks/usePhotoAlbums";
import { viewStyles } from "../../styles/photoLibrary/photoGalleryHeader";

type Props = {
  updateAlbum: Function
}

const PhotoGalleryHeader = ( { updateAlbum }: Props ): Node => {
  const navigation = useNavigation( );

  const changeAlbum = ( newAlbum ) => {
    updateAlbum( newAlbum !== "All" ? newAlbum : null );
  };

  const albums = usePhotoAlbums( );

  const placeholder = {};

  // TODO: make this navigation go back to whatever screen the user
  // was on last, not ObsList every time
  const navBack = ( ) => navigation.goBack( );

  console.log( albums, "albums header" );

  return (
    <View style={viewStyles.header}>
      <Pressable
        onPress={navBack}
      >
        <Text>back button</Text>
      </Pressable>
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
