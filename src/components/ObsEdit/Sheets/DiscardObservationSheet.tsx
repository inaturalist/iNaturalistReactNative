import {
  WarningSheet,
} from "components/SharedComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import React from "react";
import Observation from "realmModels/Observation";
import type { RealmObservationPojo } from "realmModels/types";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

interface Props {
  onPressClose: ( ) => void;
  discardObservation: ( ) => void;
  observations: RealmObservationPojo[];
  onSave?: ( ) => void;
}

const DiscardObservationSheet = ( {
  onPressClose,
  discardObservation,
  observations,
  onSave,
}: Props ) => {
  const realm = useRealm( );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const multipleObservations = observations.length > 1;

  // Note that this should only happen after import when ObsEdit has
  // multiple observations to save, none of which should have
  // corresponding photos in cameraRollPhotos, so there's no need to
  // write EXIF for those.
  const saveAllObservations = async ( ) => Promise.all(
    observations.map( o => Observation.saveLocalObservationForUpload( o, realm ) ),
  );

  const discardObservationandReset = () => {
    resetObservationFlowSlice();
    discardObservation();
  };

  return (
    <WarningSheet
      onPressClose={onPressClose}
      confirm={discardObservationandReset}
      headerText={multipleObservations
        ? t( "DISCARD-X-OBSERVATIONS", { count: observations.length } )
        : t( "DISCARD-OBSERVATION" )}
      text={multipleObservations
        ? t( "By-exiting-your-observations-not-saved" )
        : t( "By-exiting-observation-not-saved" )}
      handleSecondButtonPress={( ) => {
        saveAllObservations( );
        if ( typeof ( onSave ) === "function" ) onSave( );
      }}
      secondButtonText={multipleObservations
        ? t( "SAVE-ALL" )
        : undefined}
      buttonText={multipleObservations
        ? t( "DISCARD-ALL" )
        : t( "DISCARD-OBSERVATION" )}
    />
  );
};

export default DiscardObservationSheet;
