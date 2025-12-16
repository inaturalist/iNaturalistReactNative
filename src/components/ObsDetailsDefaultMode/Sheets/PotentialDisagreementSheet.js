// @flow

import {
  Body1,
  DisplayTaxon,
  DisplayTaxonName, List2,
  RadioButtonSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { useCurrentUser, useTranslation } from "sharedHooks";

interface Props {
  onPressClose: Function,
  onPotentialDisagreePressed: Function,
  newTaxon: Object,
  oldTaxon: Object
}

const PotentialDisagreementSheet = ( {
  onPressClose,
  onPotentialDisagreePressed,
  newTaxon,
  oldTaxon,
}: Props ): Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const showTaxonName = ( taxon, fontComponent ) => (
    <DisplayTaxonName
      bottomTextComponent={fontComponent}
      layout="horizontal"
      prefersCommonNames={currentUser?.prefers_common_names}
      removeStyling
      scientificNameFirst={currentUser?.prefers_scientific_name_first}
      small
      taxon={taxon}
      topTextComponent={fontComponent}
    />
  );

  const radioValues = {
    unsure: {
      value: false,
      labelComponent: (
        <Trans
          i18nKey="Potential-disagreement-unsure"
          components={[<Body1 />, showTaxonName( newTaxon, Body1 )]}
        />
      ),
    },
    disagree: {
      value: true,
      labelComponent: (
        <Trans
          i18nKey="Potential-disagreement-disagree"
          components={[<Body1 />, showTaxonName( newTaxon, Body1 )]}
        />
      ),
    },
  };

  const topDescriptionText = (
    <Trans
      i18nKey="Potential-disagreement-description"
      components={[<List2 />, showTaxonName( oldTaxon, List2 )]}
    />
  );

  const bottomComponent = (
    <View className="mx-6 mb-6">
      <DisplayTaxon taxon={newTaxon} />
    </View>
  );

  return (
    <RadioButtonSheet
      buttonRowClassName="mt-4"
      headerText={t( "POTENTIAL-DISAGREEMENT" )}
      confirm={checkBoxValue => {
        onPotentialDisagreePressed( checkBoxValue );
        onPressClose( );
      }}
      confirmText={t( "SUBMIT-ID-SUGGESTION" )}
      onPressClose={onPressClose}
      radioValues={radioValues}
      selectedValue={radioValues.unsure.value}
      topDescriptionText={topDescriptionText}
      bottomComponent={bottomComponent}
    />
  );
};

export default PotentialDisagreementSheet;
