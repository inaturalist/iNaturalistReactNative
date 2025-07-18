// @flow
import classnames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  DateDisplay,
  DisplayTaxonName,
  Heading6,
  INatIcon,
  ObservationLocation
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import Photo from "realmModels/Photo.ts";
import { useDebugMode, useTranslation } from "sharedHooks";
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
  hideRGLabel?: boolean,
  onUploadButtonPress: Function,
  observation: Object,
  queued: boolean,
  uploadProgress?: number,
  unsynced: boolean,
  hideObsUploadStatus?: boolean,
  hideObsStatus?: boolean,
  isSimpleObsStatus?: boolean
};

const ObsListItem = ( {
  currentUser,
  explore = false,
  hideMetadata,
  hideRGLabel = true,
  observation,
  onUploadButtonPress,
  queued,
  uploadProgress,
  unsynced,
  hideObsUploadStatus,
  hideObsStatus = false,
  isSimpleObsStatus
}: Props ): Node => {
  const { t } = useTranslation();
  const uploadStatus = useStore( state => state.uploadStatus );
  const { isDebug } = useDebugMode( );

  // made an API change so we're no longer storing user for every observation in realm,
  // because we already know all observations belong to the logged in user. so we need
  // to be explicit here about different treatment on MyObservations vs. Explore
  const belongsToCurrentUser = observation?.user?.login === currentUser?.login || !explore;

  const isObscured = observation?.obscured && !belongsToCurrentUser;
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;
  const missingBasics = (
    // Currently just a test
    isDebug
    && observation.needs_sync
    && observation.missing_basics
  );

  const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );

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
        {!hideRGLabel && qualityGrade === "research" && (
          <Heading6 className="mt-[10px] text-inatGreen">
            {t( "RESEARCH-GRADE--quality-grade" )}
          </Heading6>
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
            showObsStatus={!hideObsStatus}
            isSimpleObsStatus={isSimpleObsStatus}
          />
        )}
      </View>
    </View>
  );
};

export default ObsListItem;
