// @flow
import classnames from "classnames";
import {
  DateDisplay, DisplayTaxonName, ObservationLocation, ObsStatus
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";
import { useCurrentUser } from "sharedHooks";
import { UPLOAD_IN_PROGRESS } from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  explore: boolean,
  handleIndividualUploadPress: Function,
  showUploadStatus: boolean,
  observation: Object
};

const ObsListItem = ( {
  explore = false,
  handleIndividualUploadPress,
  showUploadStatus,
  observation
}: Props ): Node => {
  const uploadStatus = useStore( state => state.uploadStatus );

  const photo = observation?.observationPhotos?.[0]?.photo
    || observation?.observation_photos?.[0]?.photo
    || null;
  const needsSync = typeof observation.needsSync !== "undefined" && observation.needsSync( );
  const currentUser = useCurrentUser( );
  const obsPhotosCount = observation?.observationPhotos?.length
    || observation?.observation_photos?.length
    || 0;
  const hasSound = !!(
    observation?.observationSounds?.length
    || observation?.observation_sounds?.length
  );

  return (
    <View
      testID={`MyObservations.obsListItem.${observation.uuid}`}
      className="flex-row px-[15px] my-[11px]"
    >
      <ObsImagePreview
        source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( photo ) }}
        obsPhotosCount={obsPhotosCount}
        hasSound={hasSound}
        opaque={needsSync}
        isSmall
        iconicTaxonName={observation.taxon?.iconic_taxon_name}
      />
      <View className="pr-[25px] flex-1 ml-[10px]">
        <DisplayTaxonName
          taxon={observation?.taxon}
          keyBase={observation?.uuid}
          scientificNameFirst={currentUser?.prefers_scientific_name_first}
          prefersCommonNames={currentUser?.prefers_common_names}
        />
        <ObservationLocation observation={observation} classNameMargin="mt-1" />
        <DateDisplay
          dateString={
            observation.time_observed_at
            || observation.observed_on_string
            || observation.observed_on
          }
          classNameMargin="mt-1"
        />
      </View>
      <View
        className={classnames(
          "flex-0 justify-start flex-row",
          { "justify-center": uploadStatus === UPLOAD_IN_PROGRESS }
        )}
      >
        {explore
          ? (
            <ObsStatus
              observation={observation}
              layout="vertical"
              testID={`ObsStatus.${observation.uuid}`}
            />
          )
          : (
            <ObsUploadStatus
              handleIndividualUploadPress={handleIndividualUploadPress}
              layout="vertical"
              showUploadStatus={showUploadStatus}
              observation={observation}
            />
          )}
      </View>
    </View>
  );
};

export default ObsListItem;
