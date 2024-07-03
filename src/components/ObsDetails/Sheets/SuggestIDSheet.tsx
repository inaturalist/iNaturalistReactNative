import {
  BottomSheet,
  Button,
  DisplayTaxon,
  INatIcon,
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import useStore from "stores/useStore";

interface Props {
  onSuggestId:Function,
  openAddCommentSheet: Function,
  handleClose: Function
}

const showTaxon = taxon => {
  if ( !taxon ) {
    return <List2>{t( "Unknown-organism" )}</List2>;
  }
  return (
    <View className="flex-row mx-[15px]">
      <DisplayTaxon taxon={taxon} />
    </View>
  );
};

const SuggestIDSheet = ( {
  onSuggestId,
  openAddCommentSheet,
  handleClose
}: Props ): Node => {
  const currentObservation = useStore( state => state.currentObservation );
  const comment = currentObservation?.description;
  const taxon = currentObservation?.taxon;

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={t( "SUGGEST-ID" )}
    >
      <View className="mx-[26px] space-y-[11px] my-[15px]">
        <List2>
          {t( "Would-you-like-to-suggest-the-following-identification" )}
        </List2>
        { comment && (
          <View
            className=" flex-row items-center bg-lightGray p-[15px] rounded"
          >
            <INatIcon name="add-comment-outline" size={22} />
            <List2 className="ml-[7px] text-black">
              {comment}
            </List2>
          </View>
        )}
        {showTaxon( taxon )}
      </View>
      <View className="flex-row justify-evenly mx-3 mb-3">
        {comment
          ? (
            <Button
              text={t( "EDIT-COMMENT" )}
              onPress={( ) => {
                openAddCommentSheet( { isOptional: true } );
                handleClose( );
              }}
              className="mx-2 grow"
              testID="SuggestID.EditCommentButton"
              accessibilityHint={t( "Opens-add-comment-modal" )}
            />
          )
          : (
            <Button
              text={t( "ADD-COMMENT" )}
              onPress={( ) => {
                openAddCommentSheet( { isOptional: true } );
                handleClose( );
              }}
              className="mx-2 grow"
              testID="SuggestID.commentButton"
              accessibilityHint={t( "Opens-add-comment-modal" )}
            />
          )}
        <Button
          text={t( "SUGGEST-ID" )}
          onPress={( ) => {
            onSuggestId( );
            handleClose( );
          }}
          className="mx-2 grow"
          testID="SuggestIDSheet.cvSuggestionsButton"
          accessibilityRole="link"
          accessibilityHint={t( "Add-suggestion-and-remarks-to-observation" )}
          level="primary"
        />
      </View>
    </BottomSheet>
  );
};

export default SuggestIDSheet;
