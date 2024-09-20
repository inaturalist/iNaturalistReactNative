// @flow

import { Body2, DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import Photo from "realmModels/Photo";
import { useCurrentUser } from "sharedHooks";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  explore: boolean,
  handleIndividualUploadPress: Function,
  height?: string,
  observation: Object,
  showUploadStatus: boolean,
  style?: Object,
  width?: string
};

const ObsGridItem = ( {
  explore,
  handleIndividualUploadPress,
  height = "w-[200px]",
  observation,
  showUploadStatus,
  style,
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

  const displayTaxonName = useMemo( ( ) => (
    <DisplayTaxonName
      bottomTextComponent={Body2}
      color="text-white"
      ellipsizeCommonName
      keyBase={observation?.uuid}
      layout="vertical"
      prefersCommonNames={currentUser?.prefers_common_names}
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      showOneNameOnly={!explore}
      taxon={observation?.taxon}
    />
  ), [
    currentUser?.prefers_common_names,
    currentUser?.prefers_scientific_name_first,
    explore,
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
      iconicTaxonName={observation.taxon?.iconic_taxon_name}
      white
    >
      <View className="absolute bottom-0 flex p-2 w-full">
        <ObsUploadStatus
          classNameMargin="mb-1"
          explore={explore}
          handleIndividualUploadPress={handleIndividualUploadPress}
          layout="horizontal"
          observation={observation}
          showUploadStatus={showUploadStatus}
          white
        />
        {displayTaxonName}
      </View>
    </ObsImagePreview>
  );
};

export default ObsGridItem;
