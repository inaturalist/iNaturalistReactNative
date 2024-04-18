// @flow

import {
  RadioButtonSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: ( ) => void,
  selectedValue?: any,
  updateGeoprivacyStatus: ( ) => void
}

const GeoprivacySheet = ( {
  handleClose,
  selectedValue,
  updateGeoprivacyStatus
}: Props ): Node => {
  const { t } = useTranslation( );

  const radioValues = {
    open: {
      label: t( "Open" ),
      text: t( "Anyone-using-iNaturalist-can-see" ),
      value: "open"
    },
    obscured: {
      label: t( "Obscured" ),
      text: t( "The-exact-location-will-be-hidden" ),
      value: "obscured"
    },
    private: {
      label: t( "Private" ),
      text: t( "The-location-will-not-be-visible" ),
      value: "private"
    }
  };

  return (
    <RadioButtonSheet
      headerText={t( "GEOPRIVACY" )}
      confirm={checkBoxValue => {
        updateGeoprivacyStatus( checkBoxValue );
        handleClose( );
      }}
      handleClose={handleClose}
      radioValues={radioValues}
      selectedValue={selectedValue}
    />
  );
};

export default GeoprivacySheet;
