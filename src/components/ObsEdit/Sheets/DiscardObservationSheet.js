// @flow

import {
  WarningSheet,
} from "components/SharedComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

type Props = {
  onPressClose: Function,
  discardObservation: Function,
  observations: Array<Object>,
  onSave?: Function
}

const DiscardObservationSheet = ( {
  onPressClose,
  discardObservation,
  observations,
  onSave,
}: Props ): Node => {
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
      secondButtonText={multipleObservations && t( "SAVE-ALL" )}
      buttonText={multipleObservations
        ? t( "DISCARD-ALL" )
        : t( "DISCARD-OBSERVATION" )}
    />
  );
};

export default DiscardObservationSheet;
