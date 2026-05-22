import { Pressable } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

interface Props {
  currentUser: object;
  queued: boolean;
  explore: boolean;
  hideMetadata?: boolean;
  hideObsUploadStatus?: boolean;
  hideObsStatus?: boolean;
  isSimpleObsStatus?: boolean;
  hideRGLabel?: boolean;
  onUploadButtonPress: ( ) => void;
  onItemPress: ( ) => void;
  gridItemStyle: object;
  layout: "list" | "grid";
  observationUuid: string;
  uploadProgress: number;
  unsynced: boolean;
}

// const useObservation = ( uuid: string ) => {
//   const realm = useRealm();
//   const observation = realm.objectForPrimaryKey( "Observation", uuid );
//   observation?.addListener();
// };

const ObsPressable = ( {
  currentUser,
  queued,
  explore,
  hideMetadata,
  hideObsUploadStatus,
  hideObsStatus,
  isSimpleObsStatus,
  hideRGLabel,
  onUploadButtonPress,
  onItemPress,
  gridItemStyle,
  layout,
  observationUuid,
  uploadProgress,
  unsynced,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <Pressable
      testID={`ObsPressable.${observationUuid}`}
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
              observationUuid={observationUuid}
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
              observationUuid={observationUuid}
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
