// @flow

import colors from "colors";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

type Props = {
  item: Object,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function,
  selectionMode: boolean
}

const GroupPhotoImage = ( {
  item,
  selectedObservations,
  selectObservationPhotos,
  selectionMode
}: Props ): Node => {
  const firstPhoto = item.photos[0];
  const isSelected = selectedObservations.includes( item );
  const hasMultiplePhotos = item.photos.length > 1;

  const handlePress = ( ) => selectObservationPhotos( isSelected, item );

  const imageUri = firstPhoto && { uri: firstPhoto.image.uri };

  const filterIconName = item.photos.length > 9 ? "filter-9-plus" : `filter-${item.photos.length}`;

  const unselectedIcon = ( ) => (
    <View className="absolute top-2 right-2">
      <IconMaterial
        name="radio-button-off"
        color={colors.white}
        size={35}
      />
    </View>
  );

  const selectedIcon = ( ) => (
    <View className="absolute top-2 right-2">
      <IconMaterial
        name="check-circle"
        color={colors.inatGreen}
        size={35}
      />
    </View>
  );

  const numberOfPhotosIcon = ( ) => (
    <View className="absolute bottom-2 right-2">
      <IconMaterial
        // $FlowIgnore
        name={filterIconName}
        color={colors.white}
        size={35}
      />
    </View>
  );

  const renderIcon = isSelected ? selectedIcon : unselectedIcon;

  return (
    <Pressable
      onPress={handlePress}
      testID={`GroupPhotos.${firstPhoto.uri}`}
      disabled={!selectionMode}
    >
      <Image
        testID="GroupPhotos.photo"
        source={imageUri}
        className="h-44 w-44 mx-1"
      />
      {selectionMode && renderIcon( )}
      {hasMultiplePhotos && numberOfPhotosIcon( )}
    </Pressable>
  );
};

export default GroupPhotoImage;
