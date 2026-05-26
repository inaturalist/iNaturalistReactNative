import {
  RadioButtonSheet,
} from "components/SharedComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  onPressClose: ( ) => void;
  selectedValue: boolean;
  updateCaptiveStatus: ( _status: boolean ) => void;
}

const WildStatusSheet = ( {
  onPressClose,
  selectedValue,
  updateCaptiveStatus,
}: Props ) => {
  const { t } = useTranslation( );

  const radioValues = {
    wild: {
      label: t( "Wild" ),
      text: t( "This-is-a-wild-organism" ),
      value: false,
    },
    captive: {
      label: t( "Captive-Cultivated" ),
      text: t( "This-organism-was-placed-by-humans" ),
      value: true,
    },
  };

  return (
    <RadioButtonSheet
      headerText={t( "WILD-STATUS" )}
      confirm={checkBoxValue => {
        updateCaptiveStatus( checkBoxValue as boolean );
        onPressClose( );
      }}
      onPressClose={onPressClose}
      radioValues={radioValues}
      selectedValue={selectedValue}
    />
  );
};

export default WildStatusSheet;
