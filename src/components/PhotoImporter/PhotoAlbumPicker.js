// @flow

import { Text } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import RNPickerSelect from "react-native-picker-select";

const FONT_SIZE = 20;

const inputStyle = {
  fontSize: FONT_SIZE, padding: 10, paddingRight: 45
};

const pickerTextStyle = {
  inputIOS: inputStyle,
  inputAndroid: inputStyle,
  iconContainer: { right: 20 }
};

type Props = {
  albums: ?Array<Object>,
  setAlbum: Function
}

const PhotoAlbumPicker = ( { albums, setAlbum }: Props ): Node => {
  const changeAlbum = newAlbum => setAlbum( newAlbum !== "All"
    ? newAlbum
    : null );

  if ( !albums ) {
    return null;
  }

  const noAlbums = albums?.length <= 1;

  const placeholder = {};

  // eslint-disable-next-line i18next/no-literal-string
  const icon = ( ) => !noAlbums && <Text className="text-2xl">&#x2304;</Text>;

  return (
    <RNPickerSelect
      hideIcon
      items={albums}
      onValueChange={changeAlbum}
      placeholder={placeholder}
      useNativeAndroidPickerStyle={false}
      disabled={noAlbums}
      style={pickerTextStyle}
      Icon={icon}
    />
  );
};

export default PhotoAlbumPicker;
