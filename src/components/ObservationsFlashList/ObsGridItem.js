// @flow

import { Body2, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import Photo from "realmModels/Photo";
import { useCurrentUser, useFontScale } from "sharedHooks";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  explore: boolean,
  height?: string,
  observation: Object,
  onPress: Function,
  style?: Object,
  uploadProgress?: number,
  width?: string
};

const ObsGridItem = ( {
  explore,
  height = "w-[200px]",
  observation,
  onPress,
  style,
  uploadProgress,
  width = "w-[200px]"
}: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo
    || observation?.observation_photos?.[0]?.photo
    || null;
  const photoCount = observation?.observationPhotos?.length
    || observation?.observation_photos?.length;
  const hasSound = !!(
    observation?.observationSounds?.length
    || observation?.observation_sounds?.length
  );
  const currentUser = useCurrentUser( );
  const { isLargeFontScale } = useFontScale();

  const displayTaxonName = useMemo( ( ) => (
    <DisplayTaxonName
      bottomTextComponent={Body2}
      color="text-white"
      ellipsizeCommonName
      keyBase={observation?.uuid}
      layout="vertical"
      prefersCommonNames={currentUser?.prefers_common_names}
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      showOneNameOnly={!explore || isLargeFontScale}
      taxon={observation?.taxon}
    />
  ), [
    currentUser?.prefers_common_names,
    currentUser?.prefers_scientific_name_first,
    explore,
    isLargeFontScale,
    observation?.taxon,
    observation?.uuid
  ] );

  return (
    <ObsImagePreview
      source={{
        uri: Photo.displayLocalOrRemoteMediumPhoto( photo )
      }}
      width={width}
      height={height}
      style={style}
      obsPhotosCount={photoCount ?? 0}
      hasSound={hasSound}
      isMultiplePhotosTop
      testID={`MyObservations.gridItem.${observation.uuid}`}
      useShortGradient={!explore}
      iconicTaxonName={observation.taxon?.iconic_taxon_name}
      white
    >
      <View className="absolute bottom-0 flex p-2 w-full">
        <ObsUploadStatus
          classNameMargin="mb-1"
          explore={explore}
          layout="horizontal"
          observation={observation}
          onPress={onPress}
          progress={uploadProgress}
          white
        />
        {displayTaxonName}
      </View>
    </ObsImagePreview>
  );
};

export default ObsGridItem;
