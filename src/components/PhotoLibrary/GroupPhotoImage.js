// @flow

import type { Node } from "react";
import React from "react";
import { Image, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FilterIcon from "react-native-vector-icons/MaterialIcons";

import colors from "../../styles/colors";
import { imageStyles, viewStyles } from "../../styles/photoLibrary/photoGallery";

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
    <Icon name="radiobox-blank" color={colors.white} size={35} style={viewStyles.selectionIcon} />
  );
  const selectedIcon = ( ) => (
    <Icon name="check-circle" color={colors.inatGreen} size={35} style={viewStyles.selectionIcon} />
  );
  const numberOfPhotosIcon = ( ) => (
    <FilterIcon
      // $FlowFixMe
      name={filterIconName}
      color={colors.white}
      size={35}
      style={viewStyles.numOfPhotosIcon}
    />
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
        style={imageStyles.imagesForGrouping}
      />
      {selectionMode && renderIcon( )}
      {hasMultiplePhotos && numberOfPhotosIcon( )}
    </Pressable>
  );
};

export default GroupPhotoImage;
