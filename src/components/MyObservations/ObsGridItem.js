// @flow

import DisplayTaxonName from "components/DisplayTaxonName";
import { UploadStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsStatus from "./ObsStatus";
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
  const theme = useTheme( );
  const obsEditContext = useContext( ObsEditContext );
  const startSingleUpload = obsEditContext?.startSingleUpload;
  const uploadProgress = obsEditContext?.uploadProgress;
  const wasSynced = observation.wasSynced( );
  const { allObsToUpload } = uploadStatus;

  const displayUploadStatus = ( ) => {
    if ( allObsToUpload.find( upload => upload.uuid === observation.uuid ) ) {
      return (
        <UploadStatus
          progress={uploadProgress[observation.uuid] || 0}
          startSingleUpload={( ) => startSingleUpload( observation )}
          color={theme.colors.onPrimary}
          completeColor={theme.colors.onPrimary}
        >
          <UploadCompleteAnimation
            wasSynced={wasSynced}
            observation={observation}
            layout="horizontal"
            white
          />
        </UploadStatus>
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
