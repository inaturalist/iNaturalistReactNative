// @flow

import { DisplayTaxonName, ObsStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";
import { useCurrentUser } from "sharedHooks";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatusContainer from "./ObsUploadStatusContainer";

type Props = {
  observation: Object,
  width?: string,
  height?: string,
  style?: Object,
  uploadSingleObservation?: Function,
  uploadState: Object,
  explore: boolean
};

const ObsGridItem = ( {
  observation,
  width = "w-full",
  height,
  style,
  uploadSingleObservation,
  uploadState,
  explore
}: Props ): Node => {
  const photoCount = observation?.observationPhotos?.length
    || observation?.observation_photos?.length;
  const currentUser = useCurrentUser( );
  return (
    <ObsImagePreview
      source={{
        uri: Photo.displayLocalOrRemoteMediumPhoto(
          observation?.observationPhotos?.[0]?.photo || observation?.observation_photos?.[0]?.photo
        )
      }}
      width={width}
      height={height}
      style={style}
      obsPhotosCount={photoCount ?? 0}
      hasSound={!!observation?.observationSounds?.length}
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
            <ObsUploadStatusContainer
              observation={observation}
              layout="horizontal"
              white
              classNameMargin="mb-1"
              uploadSingleObservation={uploadSingleObservation}
              uploadState={uploadState}
            />

          )}
        <DisplayTaxonName
          keyBase={observation?.uuid}
          taxon={observation?.taxon}
          scientificNameFirst={
            currentUser?.prefers_scientific_name_first
          }
          layout="vertical"
          color="text-white"
          ellipsizeCommonName
        />
      </View>
    </ObsImagePreview>
  );
};

export default ObsGridItem;
