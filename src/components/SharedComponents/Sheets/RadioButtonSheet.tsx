import {
  BottomSheet,
  Button,
  DisplayTaxon,
  List2,
  RadioButtonRow
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useState } from "react";
import { Trans } from "react-i18next";
import { generateTaxonPieces } from "sharedHelpers/taxon";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  handleClose: Function,
  confirm: ( _checkedValue: string ) => void;
  confirmText?: string;
  headerText: string,
  radioValues: {
    [key: string]: {
      value: string,
      icon?: string,
      label: string,
      text?: string,
      buttonText?: string,
    }
  },
  selectedValue?: string,
  insideModal?: boolean,
  // optionalText?: string, when used causes error in precommit hook unused key
  taxon?:{
    id: number;
    name: string;
    preferred_common_name?: string;
    rank: string;
    rank_level: number;
  },
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
  insideModal,
  // optionalText,
  taxon,
  buttonRowClassName
}: Props ) => {
  const { t } = useTranslation( );
  const [checkedValue, setCheckedValue] = useState( selectedValue );

  let commonName = "";
  let scientificName = "";
  if ( taxon ) {
    const taxonPojo = ( typeof ( taxon.toJSON ) === "function" )
      ? taxon.toJSON( )
      : taxon;

    ( { commonName, scientificName } = generateTaxonPieces( taxonPojo ) );
  }

  const radioButtonRow = ( radioRow: string ) => (
    <View key={radioRow} className="pb-4">
      <RadioButtonRow
        classNames={buttonRowClassName}
        value={radioValues[radioRow].value}
        icon={radioValues[radioRow].icon}
        checked={checkedValue === radioValues[radioRow].value}
        onPress={() => setCheckedValue( radioValues[radioRow].value )}
        label={radioValues[radioRow].label}
        description={radioValues[radioRow].text}
        showTaxon
        taxonNamePieces={{ commonName, scientificName }}
      />
    </View>
  );

  const confirmLabel = confirmText || t( "CONFIRM" );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={headerText}
      insideModal={insideModal}
    >
      <View className="p-4 pt-2">
        { taxon
         && (
           <Trans
             i18nKey="Potential-disagreement-description"
             values={{ commonName, scientificName }}
             components={[<List2 />, <List2 className="italic" />]}
           />
         )}
        <View className="p-3">
          {Object.keys( radioValues ).map( radioRow => radioButtonRow( radioRow ) )}
        </View>
        {taxon && (
          <View className="mx-6 my-4">
            <DisplayTaxon taxon={taxon} />
          </View>
        )}
        <Button
          level="primary"
          onPress={( ) => confirm( checkedValue )}
          text={radioValues[checkedValue]?.buttonText ?? confirmLabel}
          accessibilityLabel={radioValues[checkedValue]?.buttonText ?? confirmLabel}
        />
      </View>
    </BottomSheet>
  );
};

export default RadioButtonSheet;
