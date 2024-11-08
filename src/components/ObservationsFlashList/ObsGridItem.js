// @flow

import { Body2, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  currentUser: Object,
  explore: boolean,
  height?: string,
  isLargeFontScale: boolean,
  observation: Object,
  onUploadButtonPress: Function,
  style?: Object,
  queued: boolean,
  uploadProgress?: number,
  width?: string,
  photo: Object,
  obsPhotosCount: number,
  hasSound: boolean
};

const ObsGridItem = ( {
  currentUser,
  explore,
  height = "w-[200px]",
  isLargeFontScale,
  observation,
  onUploadButtonPress,
  queued,
  style,
  uploadProgress,
  width = "w-[200px]",
  photo,
  obsPhotosCount,
  hasSound
}: Props ): Node => {
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
      obsPhotosCount={obsPhotosCount}
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
          onPress={onUploadButtonPress}
          queued={queued}
          progress={uploadProgress}
          white
        />
        {displayTaxonName}
      </View>
    </ObsImagePreview>
  );
};

export default ObsGridItem;
