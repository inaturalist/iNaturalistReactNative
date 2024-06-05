// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import { t } from "i18next";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

type Props = {
  handleClose: Function,
  discardObservation: Function,
  navToObsList: Function,
  observations: Array<Object>
}

const DiscardObservationSheet = ( {
  handleClose,
  discardObservation,
  navToObsList,
  observations
}: Props ): Node => {
  const realm = useRealm( );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const multipleObservations = observations.length > 1;

  const saveAllObservations = async ( ) => {
    await Promise.all( observations.map( async observation => {
      // Note that this should only happen after import when ObsEdit has
      // multiple observations to save, none of which should have
      // corresponding photos in cameraRollPhotos, so there's no need to
      // write EXIF for those.
      await Observation.saveLocalObservationForUpload( observation, realm );
    } ) );
  };

  const discardObservationandReset = () => {
    resetObservationFlowSlice();
    discardObservation();
  };

  return (
    <WarningSheet
      handleClose={handleClose}
      confirm={discardObservationandReset}
      headerText={multipleObservations
        ? t( "DISCARD-X-OBSERVATIONS", { count: observations.length } )
        : t( "DISCARD-OBSERVATION" )}
      text={multipleObservations
        ? t( "By-exiting-your-observations-not-saved" )
        : t( "By-exiting-observation-not-saved" )}
      handleSecondButtonPress={( ) => {
        saveAllObservations( );
        navToObsList( );
      }}
      secondButtonText={multipleObservations && t( "SAVE-ALL" )}
      buttonText={multipleObservations
        ? t( "DISCARD-ALL" )
        : t( "DISCARD-OBSERVATION" )}
    />
  );
};

export default DiscardObservationSheet;
