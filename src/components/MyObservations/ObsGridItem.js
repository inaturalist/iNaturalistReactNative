// @flow

import DisplayTaxonName from "components/DisplayTaxonName";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  observation: Object,
  width?: string,
  height?: string,
  style?: Object,
  uploadStatus: Object
};

const ObsGridItem = ( {
  observation,
  width = "w-full",
  height,
  style,
  uploadStatus
}: Props ): Node => (
  <ObsImagePreview
    source={{
      uri: Photo.displayLocalOrRemoteMediumPhoto(
        observation?.observationPhotos?.[0]?.photo
      )
    }}
    width={width}
    height={height}
    style={style}
    obsPhotosCount={observation?.observationPhotos?.length ?? 0}
    hasSound={!!observation?.observationSounds?.length}
    isMultiplePhotosTop
    testID={`MyObservations.gridItem.${observation.uuid}`}
  >
    <View className="absolute bottom-0 flex p-2 w-full">
      <ObsUploadStatus
        observation={observation}
        uploadStatus={uploadStatus}
        layout="horizontal"
        white
        classNameMargin="mb-1"
      />
      <DisplayTaxonName
        taxon={observation?.taxon}
        scientificNameFirst={
          observation?.user?.prefers_scientific_name_first
        }
        layout="vertical"
        color="text-white"
      />
    </View>
  </ObsImagePreview>
);

export default ObsGridItem;
