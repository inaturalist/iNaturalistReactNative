// @flow

import ActivityHeader from "components/ObsDetails/ActivityHeader";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import {
  Divider, INatIcon, UserText
} from "components/SharedComponents";
import DisplayTaxon from "components/SharedComponents/DisplayTaxon";
import {
  Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React, { useState } from "react";
import { textStyles } from "styles/obsDetails/obsDetails";

import AddCommentModal from "./AddCommentModal";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function,
  onAgree: Function,
  currentUserId?: Number,
  observationUUID: string,
  userAgreedId?: string
}

const ActivityItem = ( {
  item, navToTaxonDetails, toggleRefetch, refetchRemoteObservation, onAgree, currentUserId,
  observationUUID, userAgreedId
}: Props ): Node => {
  const { taxon, user } = item;
  const userId = currentUserId;
  const showAgreeButton = taxon && user && user.id !== userId && taxon.rank_level <= 10
  && userAgreedId !== taxon?.id;
  const [showAgreeWithIdSheet, setShowAgreeWithIdSheet] = useState( false );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [comment, setComment] = useState( "" );

  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;

  const onAgreePressed = () => {
    const agreeParams = {
      observation_id: observationUUID,
      taxon_id: taxon?.id,
      body: comment
    };

    onAgree( agreeParams );
    setShowAgreeWithIdSheet( false );
  };

  const openCommentBox = () => setShowCommentBox( true );

  const onCommentAdded = newComment => {
    setComment( newComment );
  };

  const agreeIdSheetDiscardChanges = () => {
    setComment( "" );
    setShowAgreeWithIdSheet( false );
  };

  const onIDAgreePressed = () => {
    setShowAgreeWithIdSheet( true );
  };

  return (
    <View className="flex-column ml-[15px]">
      <ActivityHeader
        item={item}
        refetchRemoteObservation={refetchRemoteObservation}
        toggleRefetch={toggleRefetch}
      />
      {taxon && (
        <View className="flex-row items-center justify-between mr-[23px] mb-4">
          <DisplayTaxon
            taxon={taxon}
            handlePress={navToTaxonDetails}
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
            withdrawn={idWithdrawn}
          />
          { showAgreeButton && (
            <Pressable
              testID="ActivityItem.AgreeIdButton"
              accessibilityRole="button"
              onPress={onIDAgreePressed}
            >
              <INatIcon name="id-agree" size={33} />
            </Pressable>
          )}
        </View>
      )}
      { !_.isEmpty( item?.body ) && (
        <View className="flex-row">
          <UserText baseStyle={textStyles.activityItemBody} text={item.body} />
        </View>
      )}
      <Divider />
      <AgreeWithIDSheet
        showAgreeWithIdSheet={showAgreeWithIdSheet}
        comment={comment}
        openCommentBox={openCommentBox}
        taxon={taxon}
        discardChanges={agreeIdSheetDiscardChanges}
        handleClose={agreeIdSheetDiscardChanges}
        onAgree={onAgreePressed}
      />
      <AddCommentModal
        edit
        commentToEdit={comment}
        onCommentAdded={onCommentAdded}
        title={t( "ADD-OPTIONAL-COMMENT" )}
        showCommentBox={showCommentBox}
        setShowCommentBox={setShowCommentBox}
      />
    </View>
  );
};

export default ActivityItem;
