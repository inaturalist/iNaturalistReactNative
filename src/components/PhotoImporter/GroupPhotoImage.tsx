import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview";
import { Pressable } from "components/styledComponents";
import React from "react";

interface Item {
  photos: {
    image: {
      uri: string;
    };
  }[];
}
interface Props {
  item: Item;
  selectedObservations: Item[];
  selectObservationPhotos: ( isSelected: boolean, item: Item ) => void;
  style?: object;
}

const GroupPhotoImage = ( {
  item,
  selectedObservations,
  selectObservationPhotos,
  style,
}: Props ) => {
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
        hideGradientOverlay
      />
    </Pressable>
  );
};

export default GroupPhotoImage;
