// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import RNPickerSelect from "react-native-picker-select";

import colors from "../../styles/colors";
import { viewStyles } from "../../styles/photoLibrary/photoGalleryHeader";
import { Text, View } from "../styledComponents";
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
    <View className="flex-row h-16">
      <HeaderBackButton onPress={navBack} tintColor={colors.black} />
      <RNPickerSelect
        hideIcon
        items={albums}
        onValueChange={changeAlbum}
        placeholder={placeholder}
        useNativeAndroidPickerStyle={false}
        disabled={albums.length <= 1}
        style={viewStyles}
      />
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <Text className="text-xl mt-3">&#x2304;</Text>
    </View>
  );
};

export default PhotoGalleryHeader;
