// @flow
import classnames from "classnames";
import {
  DateDisplay, DisplayTaxonName, ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import Photo from "realmModels/Photo";
import { useCurrentUser } from "sharedHooks";
import { UPLOAD_IN_PROGRESS } from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";

type Props = {
  explore: boolean,
  onPress: Function,
  observation: Object,
  uploadProgress?: number
};

const ObsListItem = ( {
  explore = false,
  observation,
  onPress,
  uploadProgress
}: Props ): Node => {
  const uploadStatus = useStore( state => state.uploadStatus );
  const currentUser = useCurrentUser( );

  const photo = observation?.observationPhotos?.[0]?.photo
    || observation?.observation_photos?.[0]?.photo
    || null;
  const needsSync = typeof observation.needsSync !== "undefined" && observation.needsSync( );
  const belongsToCurrentUser = observation?.user?.login === currentUser?.login;

  const obsPhotosCount = observation?.observationPhotos?.length
    || observation?.observation_photos?.length
    || 0;
  const hasSound = !!(
    observation?.observationSounds?.length
    || observation?.observation_sounds?.length
  );
  const isObscured = observation?.obscured && !belongsToCurrentUser;
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;

  const displayTaxonName = useMemo( ( ) => (
    <DisplayTaxonName
      taxon={observation?.taxon}
      keyBase={observation?.uuid}
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      prefersCommonNames={currentUser?.prefers_common_names}
    />
  ), [
    currentUser?.prefers_common_names,
    currentUser?.prefers_scientific_name_first,
    observation?.taxon,
    observation?.uuid
  ] );

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
        {displayTaxonName}
        <ObservationLocation
          observation={observation}
          obscured={isObscured}
          classNameMargin="mt-1"
        />
        <DateDisplay
          dateString={
            observation.time_observed_at
            || observation.observed_on_string
            || observation.observed_on
          }
          classNameMargin="mt-1"
          geoprivacy={geoprivacy}
          taxonGeoprivacy={taxonGeoprivacy}
          belongsToCurrentUser={belongsToCurrentUser}
        />
      </View>
      <View
        className={classnames(
          "flex-0 justify-start flex-row",
          { "justify-center": uploadStatus === UPLOAD_IN_PROGRESS }
        )}
      >
        <ObsUploadStatus
          explore={explore}
          onPress={onPress}
          layout="vertical"
          observation={observation}
          progress={uploadProgress}
          showObsStatus
        />
      </View>
    </View>
  );
};

export default ObsListItem;
