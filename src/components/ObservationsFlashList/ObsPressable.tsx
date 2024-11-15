import { Pressable } from "components/styledComponents";
import React from "react";
import RealmObservation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";

import ObsGridItem from "./ObsGridItem";
import ObsListItem from "./ObsListItem";

// TODO remove when we figure out how to type the Realm models
interface Observation extends RealmObservation {
  uuid: string;
}

type Props = {
  currentUser: Object,
  queued: boolean,
  explore: boolean,
  onUploadButtonPress: ( ) => void,
  onItemPress: ( ) => void,
  gridItemStyle: Object,
  isLargeFontScale: boolean,
  layout: "list" | "grid",
  observation: Observation,
  uploadProgress: number,
  unsynced: boolean
};

const ObsPressable = ( {
  currentUser,
  queued,
  explore,
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
  const photo = observation?.observationPhotos?.[0]?.photo
    || observation?.observation_photos?.[0]?.photo
    || null;

  const obsPhotosCount = observation?.observationPhotos?.length
    || observation?.observation_photos?.length
    || 0;
  const hasSound = !!(
    observation?.observationSounds?.length
    || observation?.observation_sounds?.length
  );

  return (
    <Pressable
      testID={`ObsPressable.${observation.uuid}`}
      onPress={onItemPress}
      accessibilityRole="link"
      accessibilityHint={unsynced
        ? t( "Navigates-to-observation-edit-screen" )
        : t( "Navigates-to-observation-details" )}
      accessibilityLabel={t( "Observation-Name", {
      // TODO: use the name that the user prefers (common or scientific)
        scientificName: observation.species_guess
      } )}
      disabled={queued}
    >
      {
        layout === "grid"
          ? (
            <ObsGridItem
              currentUser={currentUser}
              explore={explore}
              isLargeFontScale={isLargeFontScale}
              onUploadButtonPress={onUploadButtonPress}
              observation={observation}
              queued={queued}
              // 03022023 it seems like Flatlist is designed to work
              // better with RN styles than with Tailwind classes
              style={gridItemStyle}
              uploadProgress={uploadProgress}
              photo={photo}
              obsPhotosCount={obsPhotosCount}
              hasSound={hasSound}
            />
          )
          : (
            <ObsListItem
              currentUser={currentUser}
              explore={explore}
              onUploadButtonPress={onUploadButtonPress}
              observation={observation}
              queued={queued}
              uploadProgress={uploadProgress}
              unsynced={unsynced}
              photo={photo}
              obsPhotosCount={obsPhotosCount}
              hasSound={hasSound}
            />
          )
      }
    </Pressable>
  );
};

export default ObsPressable;
