// @flow
import {
  BottomSheet,
  Button,
  DisplayTaxonName,
  INatIcon,
  List2
} from "components/SharedComponents";
import {
  Image, Pressable, Text, View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import Taxon from "realmModels/Taxon";

  type Props = {
    onAgree:Function,
    handleClose: Function,
    taxon: Object,
    discardChanges: Function,
    showAgreeWithIdSheet: boolean,
    comment:string,
    openCommentBox: Function
  }

const showTaxon = taxon => {
  if ( !taxon ) {
    return <Text>{t( "Unknown-organism" )}</Text>;
  }
  return (
    <View className="flex-row mx-[15px]">
      <Image
        source={Taxon.uri( taxon )}
        className="w-16 h-16 rounded-xl mr-3"
        accessibilityIgnoresInvertColors
      />
      <Pressable
        className="justify-center"
        // onPress={navToTaxonDetails}
        testID={`ObsDetails.taxon.${taxon.id}`}
        accessibilityRole="link"
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
        accessibilityValue={{ text: taxon.name }}
      >
        <DisplayTaxonName taxon={taxon} layout="vertical" />
      </Pressable>
    </View>
  );
};

const AgreeWithIDSheet = ( {
  onAgree,
  handleClose,
  discardChanges,
  taxon,
  showAgreeWithIdSheet,
  comment,
  openCommentBox
}: Props ): Node => {
  const [snapPoint, setSnapPoint] = useState( 263 );

  useEffect( () => {
    if ( comment.length !== 0 ) {
      setSnapPoint( 393 );
    } else {
      setSnapPoint( 263 );
    }
  }, [comment] );

  return (
    <BottomSheet
      hidden={!showAgreeWithIdSheet}
      handleClose={handleClose}
      confirm={discardChanges}
      headerText={t( "AGREE-WITH-ID" )}
      snapPoints={[snapPoint]}
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
      <View className="flex-row justify-evenly mx-3">
        {comment
          ? (
            <Button
              text={t( "EDIT-COMMENT" )}
              onPress={openCommentBox}
              className="mx-2 grow"
              testID="ObsDetail.AgreeId.EditCommentButton"
              disabled={!comment}
              accessibilityHint={t( "Opens-add-comment-modal" )}
            />
          )
          : (
            <Button
              text={t( "ADD-COMMENT" )}
              onPress={openCommentBox}
              className="mx-2 grow"
              testID="ObsDetail.AgreeId.commentButton"
              disabled={false}
              accessibilityHint={t( "Opens-add-comment-modal" )}
            />
          )}

        <Button
          text={t( "AGREE" )}
          onPress={onAgree}
          className="mx-2 grow"
          testID="ObsDetail.AgreeId.cvSuggestionsButton"
          accessibilityRole="link"
          accessibilityHint={t( "Navigates-to-suggest-identification" )}
          level={comment && "primary"}
        />
      </View>
    </BottomSheet>
  );
};

export default AgreeWithIDSheet;
