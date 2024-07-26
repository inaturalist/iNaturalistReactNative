// @flow

import {
  Body1,
  DisplayTaxon,
  DisplayTaxonName, List2,
  RadioButtonSheet
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Trans } from "react-i18next";
import { useCurrentUser, useTranslation } from "sharedHooks";

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
  const currentUser = useCurrentUser( );

  const showTaxonName = fontComponent => (
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
          components={[<Body1 />, showTaxonName( Body1 )]}
        />
      )
    },
    disagree: {
      value: true,
      labelComponent: (
        <Trans
          i18nKey="Potential-disagreement-disagree"
          components={[<Body1 />, showTaxonName( Body1 )]}
        />
      )
    }
  };

  const topDescriptionText = (
    <Trans
      i18nKey="Potential-disagreement-description"
      components={[<List2 />, showTaxonName( List2 )]}
    />
  );

  const bottomComponent = (
    <View className="mx-6 mb-6">
      <DisplayTaxon taxon={taxon} />
    </View>
  );

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
      topDescriptionText={topDescriptionText}
      taxon={taxon}
      bottomComponent={bottomComponent}
    />
  );
};

export default PotentialDisagreementSheet;
