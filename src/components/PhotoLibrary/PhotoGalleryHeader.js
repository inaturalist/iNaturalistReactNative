// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import RNPickerSelect from "react-native-picker-select";
import colors from "styles/tailwindColors";

import usePhotoAlbums from "./hooks/usePhotoAlbums";

type Props = {
  updateAlbum: Function
}

const FONT_SIZE = 20;

const inputStyle = {
  fontSize: FONT_SIZE, padding: 20, paddingRight: 45
};

const pickerTextStyle = {
  inputIOS: inputStyle,
  inputAndroid: inputStyle,
  iconContainer: { right: 20, top: 10 }
};

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

  // eslint-disable-next-line i18next/no-literal-string
  const icon = ( ) => <Text className="text-2xl">&#x2304;</Text>;

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
        style={pickerTextStyle}
        Icon={icon}
      />
    </View>
  );
};

export default PhotoGalleryHeader;
