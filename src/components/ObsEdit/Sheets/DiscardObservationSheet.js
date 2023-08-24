// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";

type Props = {
  handleClose: Function,
  discardObservation: Function,
  navToObsList: Function
}

const DiscardObservationSheet = ( {
  handleClose,
  discardObservation,
  navToObsList
}: Props ): Node => {
  const {
    observations,
    saveAllObservations,
    setObservations
  } = useContext( ObsEditContext );

  const multipleObservations = observations.length > 1;

  return (
    <WarningSheet
      handleClose={handleClose}
      confirm={discardObservation}
      headerText={multipleObservations
        ? t( "DISCARD-X-OBSERVATIONS", { count: observations.length } )
        : t( "DISCARD-OBSERVATION" )}
      snapPoints={[178]}
      text={multipleObservations
        ? t( "By-exiting-your-observations-not-saved" )
        : t( "By-exiting-observation-not-saved" )}
      handleSecondButtonPress={( ) => {
        saveAllObservations( );
        setObservations( [] );
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
