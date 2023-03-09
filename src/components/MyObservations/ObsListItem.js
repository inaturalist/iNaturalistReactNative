// @flow
import DisplayTaxonName from "components/DisplayTaxonName";
import { DateDisplay, ObservationLocation, UploadStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import Photo from "realmModels/Photo";

import ObsImagePreview from "./ObsImagePreview";
import ObsStatus from "./ObsStatus";
import UploadCompleteAnimation from "./UploadIcons/UploadCompleteAnimation";

type Props = {
  observation: Object,
  uploadStatus: Object
};

const ObsListItem = ( { observation, uploadStatus }: Props ): Node => {
  const obsEditContext = useContext( ObsEditContext );
  const startSingleUpload = obsEditContext?.startSingleUpload;
  const uploadProgress = obsEditContext?.uploadProgress;
  const photo = observation?.observationPhotos?.[0]?.photo || null;
  const needsSync = observation.needsSync( );
  const wasSynced = observation.wasSynced( );
  const { allObsToUpload } = uploadStatus;

  const displayUploadStatus = ( ) => {
    if ( allObsToUpload.find( upload => upload.uuid === observation.uuid ) ) {
      return (
        <UploadStatus
          progress={uploadProgress[observation.uuid] || 0}
          startSingleUpload={( ) => startSingleUpload( observation )}
        >
          <UploadCompleteAnimation
            wasSynced={wasSynced}
            observation={observation}
            layout="vertical"
          />
        </UploadStatus>
      );
    }
    return <ObsStatus observation={observation} layout="vertical" />;
  };

  return (
    <View
      testID={`MyObservations.obsListItem.${observation.uuid}`}
      className="flex-row px-[15px] my-[11px]"
    >
      <ObsImagePreview
        source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        obsPhotosCount={observation?.observationPhotos?.length ?? 0}
        hasSound={!!observation?.observationSounds?.length}
        opaque={needsSync}
        disableGradient
        hasSmallBorderRadius
      />
      <View className="pr-[25px] flex-1 ml-[10px]">
        <DisplayTaxonName
          taxon={observation?.taxon}
          scientificNameFirst={observation?.user?.prefers_scientific_name_first}
          layout="horizontal"
        />
        <ObservationLocation observation={observation} classNameMargin="mt-1" />
        <DateDisplay
          dateString={
            observation.time_observed_at || observation.observed_on_string
          }
          classNameMargin="mt-1"
        />
      </View>
      <View className="items-center ml-auto justify-center">
        {displayUploadStatus( )}
      </View>
    </View>
  );
};

export default ObsListItem;
