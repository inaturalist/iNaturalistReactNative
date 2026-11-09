import {
  RadioButtonSheet,
} from "components/SharedComponents";
import React, { useMemo } from "react";
import type { Geoprivacy } from "realmModels/geoprivacy";
import {
  GEOPRIVACY_OBSCURED,
  GEOPRIVACY_OPEN,
  GEOPRIVACY_PRIVATE,
} from "realmModels/geoprivacy";
import useTranslation from "sharedHooks/useTranslation";

type GeoprivacyChoice = Exclude<Geoprivacy, null>;

interface Props {
  onPressClose: ( ) => void;
  selectedValue?: Geoprivacy;
  updateGeoprivacyStatus: ( _status: Geoprivacy ) => void;
}

const GeoprivacySheet = ( {
  onPressClose,
  selectedValue,
  updateGeoprivacyStatus,
}: Props ) => {
  const { t } = useTranslation( );

  const radioValues = useMemo( () => ( {
    open: {
      label: t( "Open" ),
      text: t( "Anyone-using-iNaturalist-can-see" ),
      value: GEOPRIVACY_OPEN,
    },
    obscured: {
      label: t( "Obscured" ),
      text: t( "The-exact-location-will-be-hidden" ),
      value: GEOPRIVACY_OBSCURED,
    },
    private: {
      label: t( "Private" ),
      text: t( "The-location-will-not-be-visible-to-others" ),
      value: GEOPRIVACY_PRIVATE,
    },
  } ), [t] );

  return (
    <RadioButtonSheet<GeoprivacyChoice>
      headerText={t( "GEOPRIVACY" )}
      confirm={checkBoxValue => {
        // Don't bother changing anything if we're "changing" from null
        // to "open" since they're basically the same
        if ( checkBoxValue !== GEOPRIVACY_OPEN || selectedValue !== null ) {
          updateGeoprivacyStatus( checkBoxValue );
        }
        onPressClose( );
      }}
      onPressClose={onPressClose}
      radioValues={radioValues}
      selectedValue={selectedValue || GEOPRIVACY_OPEN}
    />
  );
};

export default GeoprivacySheet;
