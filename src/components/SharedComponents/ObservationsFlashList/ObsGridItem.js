// @flow

import { Body2, DisplayTaxonName, ObsStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
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
        {explore
          ? (
            <ObsStatus
              observation={observation}
              layout="horizontal"
              testID={`ObsStatus.${observation.uuid}`}
              white
            />
          )
          : (
            <ObsUploadStatus
              classNameMargin="mb-1"
              handleIndividualUploadPress={handleIndividualUploadPress}
              layout="horizontal"
              observation={observation}
              showUploadStatus={showUploadStatus}
              white
            />
          )}
        <DisplayTaxonName
          keyBase={observation?.uuid}
          taxon={observation?.taxon}
          scientificNameFirst={
            currentUser?.prefers_scientific_name_first
          }
          prefersCommonNames={currentUser?.prefers_common_names}
          layout="vertical"
          color="text-white"
          ellipsizeCommonName
          bottomTextComponent={Body2}
        />
      </View>
    </ObsImagePreview>
  );
};

export default ObsGridItem;
