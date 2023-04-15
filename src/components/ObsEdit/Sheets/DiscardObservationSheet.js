// @flow

import { useNavigation } from "@react-navigation/native";
import {
  WarningSheet
} from "components/SharedComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";

type Props = {
  handleClose: Function,
  discardObservation: Function
}

const DiscardObservationSheet = ( {
  handleClose,
  discardObservation
}: Props ): Node => {
  const {
    observations,
    saveAllObservations,
    setObservations
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );

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
        : t( "By-exiting-changes-not-saved" )}
      handleSecondButtonPress={( ) => {
        saveAllObservations( );
        setObservations( [] );
        navigation.navigate( "ObsList" );
      }}
      secondButtonText={multipleObservations && t( "SAVE-ALL" )}
      buttonText={multipleObservations
        ? t( "DISCARD-ALL" )
        : t( "DISCARD-OBSERVATION" )}
    />
  );
};

export default DiscardObservationSheet;
