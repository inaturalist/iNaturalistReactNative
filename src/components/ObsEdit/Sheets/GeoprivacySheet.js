// @flow

import {
  RadioButtonSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  handleClose: Function,
  updateGeoprivacyStatus: Function
}

const GeoprivacySheet = ( {
  handleClose,
  updateGeoprivacyStatus
}: Props ): Node => {
  const { t } = useTranslation( );

  const radioValues = {
    first: {
      label: t( "Open" ),
      text: t( "Anyone-using-iNaturalist-can-see" ),
      value: "open"
    },
    second: {
      label: t( "Obscured" ),
      text: t( "The-exact-location-will-be-hidden" ),
      value: "obscured"
    },
    third: {
      label: t( "Private" ),
      text: t( "The-location-will-not-be-visible" ),
      value: "private"
    }
  };

  return (
    <RadioButtonSheet
      headerText={t( "GEOPRIVACY" )}
      snapPoints={[406]}
      confirm={checkBoxValue => {
        updateGeoprivacyStatus( checkBoxValue );
        handleClose( );
      }}
      handleClose={handleClose}
      radioValues={radioValues}
    />
  );
};

export default GeoprivacySheet;
