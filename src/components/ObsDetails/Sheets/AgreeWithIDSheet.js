// @flow
import {
  BottomSheet,
  Button,
  DisplayTaxon,
  INatIcon,
  List2,
  TextInputSheet
} from "components/SharedComponents";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";

type Props = {
  onAgree:Function,
  handleClose: Function,
  taxon: Object
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
  onAgree,
  handleClose,
  taxon
}: Props ): Node => {
  const [comment, setComment] = useState( "" );
  const [showCommentBox, setShowCommentBox] = useState( false );

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={t( "AGREE-WITH-ID" )}
      text={t( "By-exiting-changes-not-saved" )}
      buttonText={t( "DISCARD-CHANGES" )}
    >
      <View
        className="mx-[26px] space-y-[11px] my-[15px]"
      >
        <List2 className="text-black">
          {t( "Agree-with-ID-description" )}
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
              onPress={( ) => setShowCommentBox( true )}
              className="mx-2 grow"
              testID="ObsDetail.AgreeId.EditCommentButton"
              disabled={!comment}
              accessibilityHint={t( "Opens-add-comment-modal" )}
            />
          )
          : (
            <Button
              text={t( "ADD-COMMENT" )}
              onPress={( ) => setShowCommentBox( true )}
              className="mx-2 grow"
              testID="ObsDetail.AgreeId.commentButton"
              disabled={false}
              accessibilityHint={t( "Opens-add-comment-modal" )}
            />
          )}

        <Button
          text={t( "AGREE" )}
          onPress={( ) => {
            onAgree( comment );
          }}
          className="mx-2 grow"
          testID="ObsDetail.AgreeId.cvSuggestionsButton"
          accessibilityRole="link"
          accessibilityHint={t( "Navigates-to-suggest-identification" )}
          level={comment && "primary"}
        />
      </View>
      {showCommentBox && (
        <TextInputSheet
          handleClose={( ) => setShowCommentBox( false )}
          headerText={t( "ADD-OPTIONAL-COMMENT" )}
          confirm={textInput => setComment( textInput )}
        />
      )}
    </BottomSheet>
  );
};

export default AgreeWithIDSheet;
