import type { ApiObservation } from "api/types";
import { Pressable } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React from "react";
import RealmObservation from "realmModels/Observation";
import { useLayoutPrefs, useTranslation } from "sharedHooks";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

const { useObject } = RealmContext;

interface Props {
  currentUser: object;
  queued: boolean;
  explore: boolean;
  hideMetadata?: boolean;
  hideObsUploadStatus?: boolean;
  hideObsStatus?: boolean;
  isSimpleObsStatus?: boolean;
  hideRGLabel?: boolean;
  apiObservation?: ApiObservation;
  onUploadButtonPress: ( ) => void;
  onItemPress: ( ) => void;
  gridItemStyle: object;
  layout: "list" | "grid";
  uuid: string;
  uploadProgress: number;
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
  onUploadButtonPress,
  onItemPress,
  gridItemStyle,
  layout,
  uuid,
  uploadProgress,
  unsynced,
}: Props ) => {
  const { t } = useTranslation( );
  const { isDefaultMode } = useLayoutPrefs( );
  const rawObs = useObject<{ uuid: string }>( "Observation", uuid );
  const mapObs = isDefaultMode
    ? RealmObservation.mapObservationForMyObsDefaultMode
    : RealmObservation.mapObservationForMyObsAdvancedMode;

  // we heterogenously accept ids from MyObs and ApiObs from Explore
  // downstream heterogenously handles ApiObs and mapped Realms
  const observation = apiObservation || ( rawObs
    ? mapObs( rawObs )
    : null );
  if ( !observation ) return null;

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
      {
        layout === "grid"
          ? (
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
          )
          : (
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
          )
      }
    </Pressable>
  );
};

export default ObsPressable;
