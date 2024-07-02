// @flow

import {
  BottomSheet,
  Button,
  DisplayTaxon,
  List2,
  RadioButtonRow
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Trans } from "react-i18next";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  handleClose: Function,
  confirm: Function,
  taxon: Object
}

const PotentialDisagreementSheet = ( {
  handleClose,
  confirm,
  taxon
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checked, setChecked] = useState( "none" );

  const taxonPojo = typeof ( taxon.toJSON ) === "function"
    ? taxon.toJSON( )
    : taxon;
  const {
    commonName,
    scientificName
  } = generateTaxonPieces( taxonPojo );

  const radioValues = {
    unsure: {
      label: t( "Potential-disagreement-unsure", { commonName, scientificName } ),
      value: false
    },
    disagree: {
      label: t( "Potential-disagreement-disagree", { commonName, scientificName } ),
      value: true
    }
  };

  const radioButtonRow = radioRow => (
    <RadioButtonRow
      classNames="mt-4"
      key={radioRow}
      value={radioValues[radioRow].value}
      checked={checked === radioValues[radioRow].value}
      onPress={() => setChecked( radioValues[radioRow].value )}
      label={radioValues[radioRow].label}
    />
  );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={t( "POTENTIAL-DISAGREEMENT" )}
    >
      <View className="p-5 space-y-4">
        <Trans
          i18nKey="Potential-disagreement-description"
          values={{ commonName, scientificName }}
          components={[<List2 />, <List2 className="italic" />]}
        />
        {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        <View className="mx-6">
          <DisplayTaxon taxon={taxon} />
        </View>
        <Button
          level="primary"
          onPress={( ) => confirm( checked )}
          text={t( "SUBMIT-ID-SUGGESTION" )}
          className="mt-[15px]"
          accessibilityLabel={t( "SUBMIT-ID-SUGGESTION" )}
        />
      </View>
    </BottomSheet>
  );
};

export default PotentialDisagreementSheet;
