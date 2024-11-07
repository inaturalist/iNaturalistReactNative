import { useNavigation } from "@react-navigation/native";
import navigateToObsEdit from "components/ObsEdit/helpers/navigateToObsEdit.ts";
import React, { PropsWithChildren } from "react";
import { Pressable } from "react-native";
import RealmObservation from "realmModels/Observation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

// TODO remove when we figure out how to type the Realm models
interface Observation extends RealmObservation {
  species_guess?: string;
  uuid: string;
}

interface Props extends PropsWithChildren {
  observation: Observation;
  // Uniquely identify the list this observation appears in so we can ensure
  // ObsDetails doesn't get pushed onto the stack twice after multiple taps
  obsListKey: string;
  testID?: string;
}

const ObsPressable = ( {
  children,
  observation,
  obsListKey = "unknown",
  testID
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const prepareObsEdit = useStore( state => state.prepareObsEdit );
  const setMyObsOffsetToRestore = useStore( state => state.setMyObsOffsetToRestore );

  const unsynced = typeof observation.wasSynced !== "undefined" && !observation.wasSynced( );

  const navigateToObservation = ( ) => {
    const { uuid } = observation;
    if ( unsynced ) {
      prepareObsEdit( observation );
      navigateToObsEdit( navigation, setMyObsOffsetToRestore );
    } else {
      navigation.navigate( {
        key: `Obs-${obsListKey}-${uuid}`,
        name: "ObsDetails",
        params: { uuid }
      } );
    }
  };

  return (
    <Pressable
      testID={testID}
      onPress={navigateToObservation}
      accessibilityRole="link"
      accessibilityHint={unsynced
        ? t( "Navigates-to-observation-edit-screen" )
        : t( "Navigates-to-observation-details" )}
      accessibilityLabel={t( "Observation-Name", {
        // TODO: use the name that the user prefers (common or scientific)
        scientificName: observation.species_guess
      } )}
    >
      {children}
    </Pressable>
  );
};

export default ObsPressable;
