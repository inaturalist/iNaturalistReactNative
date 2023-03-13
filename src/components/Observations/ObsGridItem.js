// @flow

import classNames from "classnames";
import DisplayTaxonName from "components/DisplayTaxonName";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";
import Photo from "realmModels/Photo";

import ObservationInfo from "./ObservationInfo";
import ObsPreviewImage from "./ObsPreviewImage";

type Props = {
  observation: Object,
  isProject?: boolean,
  height?: string,
  width?: string,
};

const ObsGridItem = ( {
  observation,
  isProject = false,
  width = "w-full",
  height = "h-[172px]"
}: Props ): Node => {
  const photo = observation?.observationPhotos?.[0]?.photo;

  const imageSource = isProject
    ? Observation.projectUri( observation )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  return (
    <View
      className={classNames( "rounded-[17px] overflow-hidden", height, width )}
      testID={`ObsList.gridItem.${observation.uuid}`}
    >
      <ObsPreviewImage
        source={imageSource}
        height="h-[172px]"
        width="w-full"
        obsPhotosCount={observation?.observationPhotos?.length ?? 0}
        hasSound={!!observation?.observationSounds?.length}
        isMultiplePhotosTop
      >
        <View className="absolute bottom-0 flex p-2 w-full">
          <ObservationInfo
            observation={observation}
            obsStatusLayout="horizontal"
            hideUploadInfo={isProject}
            obsStatusWhite
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
      </ObsPreviewImage>
    </View>
  );
};

export default ObsGridItem;
