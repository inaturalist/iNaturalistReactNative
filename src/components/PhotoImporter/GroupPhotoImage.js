// @flow

import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview";
import { Pressable } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  item: Object,
  selectedObservations: Array<Object>,
  selectObservationPhotos: Function,
  style?: Object
};

const GroupPhotoImage = ( {
  item,
  selectedObservations,
  selectObservationPhotos,
  style
}: Props ): Node => {
  const firstPhoto = item.photos[0];
  const isSelected = selectedObservations.includes( item );
  const handlePress = ( ) => selectObservationPhotos( isSelected, item );

  const source = firstPhoto && { uri: firstPhoto.image.uri };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      testID={`GroupPhotos.${firstPhoto.image.uri}`}
      className="rounded-[17px] overflow-hidden"
    >
      <ObsImagePreview
        source={source}
        style={style}
        selected={isSelected}
        obsPhotosCount={item.photos.length}
        selectable
      />
    </Pressable>
  );
};

export default GroupPhotoImage;
