// @flow
import classnames from "classnames";
import {
  DateDisplay,
  DisplayTaxonName,
  INatIcon,
  ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import Photo from "realmModels/Photo";
import { useDebugMode } from "sharedHooks";
import { UPLOAD_IN_PROGRESS } from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import ObsImagePreview from "./ObsImagePreview";
import ObsUploadStatus from "./ObsUploadStatus";
import {
  observationHasSound,
  photoCountFromObservation,
  photoFromObservation
} from "./util";

type Props = {
  currentUser: Object,
  explore: boolean,
  hideMetadata?: boolean,
  onUploadButtonPress: Function,
  observation: Object,
  queued: boolean,
  uploadProgress?: number,
  unsynced: boolean,
  hideObsUploadStatus?: boolean
};

const ObsListItem = ( {
  currentUser,
  explore = false,
  hideMetadata,
  observation,
  onUploadButtonPress,
  queued,
  uploadProgress,
  unsynced,
  hideObsUploadStatus
}: Props ): Node => {
  const uploadStatus = useStore( state => state.uploadStatus );
  const { isDebug } = useDebugMode( );

  const belongsToCurrentUser = observation?.user?.login === currentUser?.login;

  const isObscured = observation?.obscured && !belongsToCurrentUser;
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;
  const missingBasics = (
    // Currently just a test
    isDebug
    // Only works for Realm observations
    && typeof ( observation.needsSync ) === "function"
    && observation.needsSync()
    && observation.missingBasics()
  );

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
      <View>
        <ObsImagePreview
          source={{
            uri: Photo.displayLocalOrRemoteSquarePhoto(
              photoFromObservation( observation )
            )
          }}
          obsPhotosCount={photoCountFromObservation( observation )}
          hidePhotoCount={missingBasics}
          hasSound={observationHasSound( observation )}
          opaque={!!currentUser && unsynced}
          isSmall
          iconicTaxonName={observation.taxon?.iconic_taxon_name}
        />
        {missingBasics && (
          <View className="absolute bottom-2 right-2">
            <INatIcon
              name="triangle-exclamation"
              color={colors.warningRed}
              size={16}
            />
          </View>
        )}
      </View>
      <View className="pr-[25px] flex-1 ml-[10px] justify-center">
        {displayTaxonName}
        {!hideMetadata && (
          <>
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
              timeZone={observation.observed_time_zone}
              belongsToCurrentUser={belongsToCurrentUser}
              literalTime={!observation.observed_time_zone}
            />
          </>
        )}
      </View>
      <View
        className={classnames(
          "flex-0 justify-start flex-row",
          // Hard-coding these dimensions keeps the layout from jumping around
          // when the children change
          "w-[51px]",
          "h-[65px]",
          { "justify-center": uploadStatus === UPLOAD_IN_PROGRESS }
        )}
      >
        {!hideObsUploadStatus && (
          <ObsUploadStatus
            explore={explore}
            onPress={onUploadButtonPress}
            layout="vertical"
            observation={observation}
            progress={uploadProgress}
            queued={queued}
            showObsStatus
          />
        )}
      </View>
    </View>
  );
};

export default ObsListItem;
