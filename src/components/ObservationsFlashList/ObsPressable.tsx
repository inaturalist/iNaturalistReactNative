import type { ApiObservation } from "api/types";
import { Pressable } from "components/styledComponents";
import React, { useMemo } from "react";
import RealmObservation from "realmModels/Observation";
import type { RealmObservation as RealmObservationType } from "realmModels/types";
import type { UserPojo } from "realmModels/User";
import { useLayoutPrefs, useListItemObservation, useTranslation } from "sharedHooks";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";
import SmallGridObsItem from "./SmallGridObsItem";

interface Props {
  currentUser: UserPojo | null;
  queued: boolean;
  explore: boolean;
  hideMetadata?: boolean;
  hideObsUploadStatus?: boolean;
  hideObsStatus?: boolean;
  isSimpleObsStatus?: boolean;
  hideRGLabel?: boolean;
  apiObservation?: ApiObservation;
  // A caller that already reads the observation from Realm passes it here, so this doesn't
  // subscribe to it a second time
  observation?: RealmObservationType | null;
  onUploadButtonPress: ( ) => void;
  onItemPress: ( ) => void;
  // only meaningful for layout === "grid"
  gridItemStyle?: object;
  // only meaningful for layout === "smallGrid"
  height?: number;
  width?: number;
  layout: "list" | "grid" | "smallGrid";
  uuid: string;
  // undefined here can mean "not currently uploading," which we use to decide
  // whether to render an upload icon at all. Don't default/coalesce this at call sites.
  uploadProgress?: number;
  unsynced: boolean;
}

const ObsPressable = ( {
  currentUser,
  queued,
  explore,
  hideMetadata,
  hideObsUploadStatus,
  hideObsStatus,
  isSimpleObsStatus,
  hideRGLabel,
  apiObservation,
  observation: observationProp,
  onUploadButtonPress,
  onItemPress,
  gridItemStyle,
  height,
  width,
  layout,
  uuid,
  uploadProgress,
  unsynced,
}: Props ) => {
  const { t } = useTranslation( );
  const { isDefaultMode } = useLayoutPrefs( );
  // Only subscribe when nothing else supplies the observation
  const subscribedRealmObs = useListItemObservation(
    apiObservation || observationProp !== undefined
      ? null
      : uuid,
  );
  const rawRealmObs = observationProp !== undefined
    ? observationProp
    : subscribedRealmObs;
  const mappedRealmObs = useMemo( () => {
    if ( rawRealmObs === null ) {
      return null;
    }
    return isDefaultMode
      ? RealmObservation.mapObservationForMyObsDefaultMode( rawRealmObs )
      : RealmObservation.mapObservationForMyObsAdvancedMode( rawRealmObs );
  }, [rawRealmObs, isDefaultMode] );

  const observation = apiObservation || mappedRealmObs;
  if ( !observation ) return null;

  let content;
  if ( layout === "grid" ) {
    content = (
      <ObsGridItem
        currentUser={currentUser}
        explore={explore}
        hideObsUploadStatus={hideObsUploadStatus}
        onUploadButtonPress={onUploadButtonPress}
        observation={observation}
        queued={queued}
        // 03022023 it seems like Flatlist is designed to work
        // better with RN styles than with Tailwind classes
        style={gridItemStyle}
        uploadProgress={uploadProgress}
      />
    );
  } else if ( layout === "smallGrid" ) {
    // width/height should always come from SmallGrid's renderTile. if a caller
    // somehow omits one, render nothing rather than guessing a size.
    if ( width === undefined || height === undefined ) return null;
    content = (
      <SmallGridObsItem
        currentUser={currentUser}
        height={height}
        observation={observation}
        onUploadButtonPress={onUploadButtonPress}
        queued={queued}
        uploadProgress={uploadProgress}
        width={width}
      />
    );
  } else {
    content = (
      <ObsListItem
        currentUser={currentUser}
        explore={explore}
        hideMetadata={hideMetadata}
        hideObsUploadStatus={hideObsUploadStatus}
        hideObsStatus={hideObsStatus}
        isSimpleObsStatus={isSimpleObsStatus}
        hideRGLabel={hideRGLabel}
        onUploadButtonPress={onUploadButtonPress}
        observation={observation}
        queued={queued}
        uploadProgress={uploadProgress}
        unsynced={unsynced}
      />
    );
  }

  return (
    <Pressable
      testID={`ObsPressable.${uuid}`}
      onPress={onItemPress}
      accessibilityRole="link"
      accessibilityHint={unsynced
        ? t( "Navigates-to-observation-edit-screen" )
        : t( "Navigates-to-observation-details" )}
      disabled={queued}
    >
      {content}
    </Pressable>
  );
};

export default ObsPressable;
