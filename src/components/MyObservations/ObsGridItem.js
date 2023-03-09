// @flow

import DisplayTaxonName from "components/DisplayTaxonName";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsStatus from "./ObsStatus";
import UploadButton from "./UploadIcons/UploadButton";
import UploadCircularProgress from "./UploadIcons/UploadCircularProgress";
import UploadCompleteAnimation from "./UploadIcons/UploadCompleteAnimation";

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
}: Props ): Node => {
  const needsSync = observation.needsSync( );
  const wasSynced = observation.wasSynced( );
  const isUploading = uploadStatus.currentObsUuid === observation.uuid;

  const displayUploadStatus = ( ) => {
    if ( isUploading ) {
      return <UploadCircularProgress white layout="horizontal" />;
    }
    if ( needsSync ) {
      return <UploadButton observation={observation} white layout="horizontal" />;
    }
    if ( wasSynced ) {
      return (
        <UploadCompleteAnimation
          wasSynced={wasSynced}
          observation={observation}
          layout="horizontal"
          white
          classNameMargin="mb-1"
        />
      );
    }
    return (
      <ObsStatus
        observation={observation}
        layout="horizontal"
        white
        classNameMargin="mb-1"
      />
    );
  };

  return (
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
        {displayUploadStatus( )}
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
};

export default ObsGridItem;
