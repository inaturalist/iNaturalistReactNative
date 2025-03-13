import { Pressable } from "components/styledComponents";
import React from "react";
import type { RealmObservation } from "realmModels/types";
import { useTranslation } from "sharedHooks";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

type Props = {
  currentUser: Object,
  queued: boolean,
  explore: boolean,
  hideMetadata?: boolean,
  hideObsUploadStatus?: boolean,
  hideObsStatus?: boolean,
  onUploadButtonPress: ( ) => void,
  onItemPress: ( ) => void,
  gridItemStyle: Object,
  isLargeFontScale: boolean,
  layout: "list" | "grid",
  observation: RealmObservation,
  uploadProgress: number,
  unsynced: boolean
};

const ObsPressable = ( {
  currentUser,
  queued,
  explore,
  hideMetadata,
  hideObsUploadStatus,
  hideObsStatus,
  isLargeFontScale,
  onUploadButtonPress,
  onItemPress,
  gridItemStyle,
  layout,
  observation,
  uploadProgress,
  unsynced
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <Pressable
      testID={`ObsPressable.${observation.uuid}`}
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
              isLargeFontScale={isLargeFontScale}
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
