// @flow

import {
  RadioButtonSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  updateCaptiveStatus: Function
}

const WildStatusSheet = ( {
  handleClose,
  updateCaptiveStatus
}: Props ): Node => {
  const { t } = useTranslation( );

  const radioValues = {
    first: {
      label: t( "Wild" ),
      text: t( "This-is-a-wild-organism" ),
      value: false
    },
    second: {
      label: t( "Captive-Cultivated" ),
      text: t( "This-organism-was-placed-by-humans" ),
      value: true
    }
  };

  return (
    <RadioButtonSheet
      headerText={t( "WILD-STATUS" )}
      snapPoints={[298]}
      confirm={checkBoxValue => {
        updateCaptiveStatus( checkBoxValue );
        handleClose( );
      }}
      handleClose={handleClose}
      radioValues={radioValues}
    />
  );
};

export default WildStatusSheet;
