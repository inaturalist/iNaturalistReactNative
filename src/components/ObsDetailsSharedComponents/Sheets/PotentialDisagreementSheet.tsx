import type { ApiTaxon } from "api/types";
import {
  Body1,
  Button,
  DisplayTaxon,
  DisplayTaxonName,
  INatIcon,
  List2,
  RadioButtonSheet,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import type { RealmTaxon } from "realmModels/types";
import { useCurrentUser, useTranslation } from "sharedHooks";

interface Props {
  editIdentBody: () => void;
  hidden?: boolean;
  identBody?: string;
  loading?: boolean;
  onPressClose: () => void;
  onPotentialDisagreePressed: ( _checkedValue: boolean ) => void;
  newTaxon: RealmTaxon | ApiTaxon;
  oldTaxon: RealmTaxon | ApiTaxon;
}

const PotentialDisagreementSheet = ( {
  editIdentBody,
  hidden,
  identBody,
  loading,
  onPressClose,
  onPotentialDisagreePressed,
  newTaxon,
  oldTaxon,
}: Props ) => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const showTaxonName = ( reactKey: string, taxon: object, fontComponent: React.FC ) => (
    <DisplayTaxonName
      key={reactKey}
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
          components={[
            <Body1 key="0" />,
            showTaxonName( "1", newTaxon, Body1 ),
          ]}
        />
      ),
    },
    disagree: {
      value: true,
      labelComponent: (
        <Trans
          i18nKey="Potential-disagreement-disagree"
          components={[
            <Body1 key="0" />,
            showTaxonName( "1", newTaxon, Body1 ),
          ]}
        />
      ),
    },
  };

  const topDescriptionText = (
    <Trans
      i18nKey="Potential-disagreement-description"
      components={[
        <List2 key="0" />,
        showTaxonName( "1", oldTaxon, List2 ),
      ]}
    />
  );

  const bottomComponent = (
    <View className="mx-6 mb-6">
      {identBody && (
        <View className="flex-row items-center bg-lightGray p-[15px] rounded mb-[15px]">
          <INatIcon name="add-comment-outline" size={22} />
          <List2 className="ml-[7px] text-darkGray flex-1">
            {identBody}
          </List2>
        </View>
      )}
      <DisplayTaxon taxon={newTaxon} />
    </View>
  );

  const commentButton = (
    <Button
      text={identBody
        ? t( "EDIT-COMMENT" )
        : t( "ADD-COMMENT" )}
      onPress={editIdentBody}
      disabled={loading}
      testID="PotentialDisagreementSheet.commentButton"
      accessibilityHint={t( "Opens-add-comment-form" )}
    />
  );

  return (
    <RadioButtonSheet
      buttonRowClassName="mt-4"
      headerText={t( "POTENTIAL-DISAGREEMENT" )}
      confirm={checkBoxValue => {
        onPotentialDisagreePressed( checkBoxValue );
      }}
      hidden={hidden}
      loading={loading}
      confirmText={t( "SUBMIT" )}
      onPressClose={onPressClose}
      radioValues={radioValues}
      requireSelectionChange={false}
      secondaryButton={commentButton}
      selectedValue={radioValues.unsure.value}
      topDescriptionText={topDescriptionText}
      bottomComponent={bottomComponent}
    />
  );
};

export default PotentialDisagreementSheet;
