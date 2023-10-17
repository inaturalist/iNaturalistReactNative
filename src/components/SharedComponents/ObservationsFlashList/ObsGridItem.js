// @flow

import { DisplayTaxonName } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatusContainer from "./ObsUploadStatusContainer";

type Props = {
  observation: Object,
  width?: string,
  height?: string,
  style?: Object,
  setShowLoginSheet: Function
};

const ObsGridItem = ( {
  observation,
  width = "w-full",
  height,
  style,
  setShowLoginSheet
}: Props ): Node => (
  <ObsImagePreview
    source={{
      uri: Photo.displayLocalOrRemoteMediumPhoto(
        observation?.observationPhotos?.[0]?.photo || observation?.observation_photos?.[0]?.photo
      )
    }}
    width={width}
    height={height}
    style={style}
    obsPhotosCount={observation?.observationPhotos?.length ?? 0}
    hasSound={!!observation?.observationSounds?.length}
    isMultiplePhotosTop
    testID={`MyObservations.gridItem.${observation.uuid}`}
    iconicTaxonName={observation.taxon?.iconic_taxon_name}
    white
  >
    <View className="absolute bottom-0 flex p-2 w-full">
      <ObsUploadStatusContainer
        observation={observation}
        layout="horizontal"
        white
        classNameMargin="mb-1"
        setShowLoginSheet={setShowLoginSheet}
      />
      <DisplayTaxonName
        keyBase={observation?.uuid}
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
