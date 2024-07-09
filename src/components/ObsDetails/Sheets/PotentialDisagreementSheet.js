// @flow

import {
  RadioButtonSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  handleClose: Function,
  onPotentialDisagreePressed: Function,
  taxon: Object
}

const PotentialDisagreementSheet = ( {
  handleClose,
  onPotentialDisagreePressed,
  taxon
}: Props ): Node => {
  const { t } = useTranslation( );

  const taxonPojo = typeof ( taxon.toJSON ) === "function"
    ? taxon.toJSON( )
    : taxon;
  const {
    commonName,
    rank,
    scientificName
  } = generateTaxonPieces( taxonPojo );

  const radioValues = {
    unsure: {
      label: t( "Potential-disagreement-unsure", { commonName, rank, scientificName } ),
      value: false
    },
    disagree: {
      label: t( "Potential-disagreement-disagree", { commonName, rank, scientificName } ),
      value: true
    }
  };

  return (
    <RadioButtonSheet
      buttonRowClassName="mt-4"
      headerText={t( "POTENTIAL-DISAGREEMENT" )}
      confirm={checkBoxValue => {
        onPotentialDisagreePressed( checkBoxValue );
        handleClose( );
      }}
      confirmText={t( "SUBMIT-ID-SUGGESTION" )}
      handleClose={handleClose}
      radioValues={radioValues}
      selectedValue={radioValues.unsure.value}
      taxon={taxon}
    />
  );
};

export default PotentialDisagreementSheet;
