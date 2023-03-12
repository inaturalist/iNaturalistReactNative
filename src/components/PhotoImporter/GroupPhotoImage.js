// @flow

import ObsPreviewImage from "components/Observations/ObsPreviewImage";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

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

  const handlePress = ( ) => selectObservationPhotos( isSelected, item );

  const source = firstPhoto && { uri: firstPhoto.image.uri };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      testID={`GroupPhotos.${firstPhoto.uri}`}
      className="rounded-[17px] overflow-hidden m-1"
    >
      <ObsPreviewImage
        source={source}
        height="h-44"
        width="w-44"
        selected={isSelected}
        obsPhotosCount={item.photos.length}
        selectable
      />
    </Pressable>
  );
};

export default GroupPhotoImage;
