// @flow

import {
  RadioButtonSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: ( ) => void,
  selectedValue: any,
  updateCaptiveStatus: ( ) => void
}

const WildStatusSheet = ( {
  handleClose,
  selectedValue,
  updateCaptiveStatus
}: Props ): Node => {
  const { t } = useTranslation( );

  const radioValues = {
    wild: {
      label: t( "Wild" ),
      text: t( "This-is-a-wild-organism" ),
      value: false
    },
    captive: {
      label: t( "Captive-Cultivated" ),
      text: t( "This-organism-was-placed-by-humans" ),
      value: true
    }
  };

  return (
    <RadioButtonSheet
      headerText={t( "WILD-STATUS" )}
      confirm={checkBoxValue => {
        updateCaptiveStatus( checkBoxValue );
        handleClose( );
      }}
      handleClose={handleClose}
      radioValues={radioValues}
      selectedValue={selectedValue}
    />
  );
};

export default WildStatusSheet;
