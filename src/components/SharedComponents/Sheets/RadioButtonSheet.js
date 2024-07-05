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

type Props = {
  handleClose: Function,
  confirm: Function,
  confirmText?: string,
  headerText: string,
  radioValues: Object,
  selectedValue?: string,
  insideModal?: boolean,
  // optionalText?: string, when used causes error in precommit hook unused key
  taxon?: Object,
  buttonRowClassName?: boolean
}

const RadioButtonSheet = ( {
  handleClose,
  confirm,
  confirmText,
  headerText,
  radioValues,
  selectedValue = "none",
  insideModal,
  // optionalText,
  taxon,
  buttonRowClassName
}: Props ): Node => {
  const { t } = useTranslation( );
  const [checked, setChecked] = useState( selectedValue );

  let commonName = "";
  let scientificName = "";
  if ( taxon ) {
    const taxonPojo = ( typeof ( taxon.toJSON ) === "function" )
      ? taxon.toJSON( )
      : taxon;

    ( { commonName, scientificName } = generateTaxonPieces( taxonPojo ) );
  }

  const radioButtonRow = radioRow => (
    <RadioButtonRow
      classNames={buttonRowClassName}
      key={radioRow}
      value={radioValues[radioRow].value}
      icon={radioValues[radioRow].icon}
      checked={checked === radioValues[radioRow].value}
      onPress={() => setChecked( radioValues[radioRow].value )}
      label={radioValues[radioRow].label}
      description={radioValues[radioRow].text}
      showTaxon
      taxonNamePieces={{ commonName, scientificName }}
    />
  );

  const confirmLabel = confirmText || t( "CONFIRM" );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
      insideModal={insideModal}
    >
      <View className="p-5">
        { taxon
         && (
           <Trans
             i18nKey="Potential-disagreement-description"
             values={{ commonName, scientificName }}
             components={[<List2 />, <List2 className="italic" />]}
           />
         )}
        {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        {taxon && (
          <View className="mx-6 my-4">
            <DisplayTaxon taxon={taxon} />
          </View>
        )}
        <Button
          level="primary"
          onPress={( ) => confirm( checked )}
          text={radioValues[checked]?.buttonText ?? confirmLabel}
          className="mt-[15px]"
          accessibilityLabel={radioValues[checked]?.buttonText ?? confirmLabel}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
