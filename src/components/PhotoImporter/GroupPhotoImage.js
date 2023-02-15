// @flow

import classnames from "classnames";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

type Props = {
  item: Object,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function
}

const GroupPhotoImage = ( {
  item,
  selectedObservations,
  selectObservationPhotos
}: Props ): Node => {
  const firstPhoto = item.photos[0];
  const isSelected = selectedObservations.includes( item );
  const hasMultiplePhotos = item.photos.length > 1;

  const handlePress = ( ) => selectObservationPhotos( isSelected, item );

  const imageUri = firstPhoto && { uri: firstPhoto.image.uri };

  const filterIconName = item.photos.length > 9 ? "filter-9-plus" : `filter-${item.photos.length}`;

  const renderIcon = ( ) => (
    <View className="absolute top-2 right-2">
      <IconMaterial
        name={isSelected ? "check-circle" : "radio-button-off"}
        color={colors.white}
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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      testID={`GroupPhotos.${firstPhoto.uri}`}
      className={classnames( "rounded-[17px] overflow-hidden mx-1" )}
    >
      <Image
        testID="GroupPhotos.photo"
        source={imageUri}
        className="h-44 w-44"
      />
      {renderIcon( )}
      {hasMultiplePhotos && numberOfPhotosIcon( )}
    </Pressable>
  );
};

export default GroupPhotoImage;
