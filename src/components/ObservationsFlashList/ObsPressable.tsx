import React, { PropsWithChildren } from "react";
import { Pressable } from "react-native";
import RealmObservation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";

// TODO remove when we figure out how to type the Realm models
interface Observation extends RealmObservation {
  species_guess?: string;
  uuid: string;
}

interface Props extends PropsWithChildren {
  observation: Observation;
  testID?: string;
  queued: boolean;
  onItemPress: ( ) => void;
  unsynced: boolean;
}

const ObsPressable = ( {
  children,
  observation,
  testID,
  queued = false,
  onItemPress,
  unsynced
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <Pressable
      testID={testID}
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
      {children}
    </Pressable>
  );
};

export default ObsPressable;
