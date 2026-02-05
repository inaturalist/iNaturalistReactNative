// @flow
import {
  BottomSheet,
  Button,
  DisplayTaxon,
  INatIcon,
  List2,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

type Props = {
  editIdentBody: Function,
  hidden?: boolean,
  identification: {
    body?: string,
    taxon: { id: number },
    vision?: boolean
  },
  onAgree:Function,
  onPressClose: Function,
}

const showTaxon = taxon => {
  if ( !taxon ) {
    return <Text>{t( "Unknown-organism" )}</Text>;
  }
  return (
    <View className="flex-row mx-[15px]">
      <DisplayTaxon taxon={taxon} />
    </View>
  );
};

const AgreeWithIDSheet = ( {
  editIdentBody,
  hidden,
  identification,
  onAgree,
  onPressClose,
}: Props ): Node => (
  <BottomSheet
    headerText={t( "AGREE-WITH-ID" )}
    hidden={hidden}
    onPressClose={onPressClose}
  >
    <View
      className="mx-[26px] space-y-[11px] my-[15px]"
    >
      <List2 className="text-darkGray">
        {t( "Agree-with-ID-description" )}
      </List2>
      { identification.body && (
        <View
          className=" flex-row items-center bg-lightGray p-[15px] rounded"
        >
          <INatIcon name="add-comment-outline" size={22} />
          <List2 className="ml-[7px] text-darkGray">
            {identification.body}
          </List2>
        </View>
      )}
      {showTaxon( identification.taxon )}
    </View>
    <View className="flex-row mx-3 mb-3">
      {identification.body
        ? (
          <Button
            text={t( "EDIT-COMMENT" )}
            onPress={( ) => {
              editIdentBody( );
            }}
            className="mx-2 flex-1"
            testID="ObsDetail.AgreeId.EditCommentButton"
            accessibilityHint={t( "Opens-edit-comment-form" )}
          />
        )
        : (
          <Button
            text={t( "ADD-COMMENT" )}
            onPress={( ) => {
              editIdentBody( );
            }}
            className="mx-2 flex-1"
            testID="ObsDetail.AgreeId.commentButton"
            accessibilityHint={t( "Opens-add-comment-form" )}
          />
        )}

      <Button
        text={t( "AGREE" )}
        onPress={( ) => onAgree( identification )}
        className="mx-2 flex-1"
        testID="ObsDetail.AgreeId.cvSuggestionsButton"
        accessibilityRole="link"
        accessibilityHint={t( "Navigates-to-suggest-identification" )}
        level="primary"
      />
    </View>
  </BottomSheet>
);

export default AgreeWithIDSheet;
