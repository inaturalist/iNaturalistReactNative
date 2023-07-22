// @flow

import ActivityHeader from "components/ObsDetails/ActivityHeader";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import { DisplayTaxonName, Divider } from "components/SharedComponents";
import INatIcon from "components/SharedComponents/INatIcon";
import UserText from "components/SharedComponents/UserText";
import {
  Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React, { useState } from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Taxon from "realmModels/Taxon";
import useIsConnected from "sharedHooks/useIsConnected";
import { textStyles } from "styles/obsDetails/obsDetails";

import AddCommentModal from "./AddCommentModal";
import TaxonImage from "./TaxonImage";

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
  const isOnline = useIsConnected( );
  const userId = currentUserId;
  const [hideAgreeWithIdSheet, setHideAgreeWithIdSheet] = useState( true );
  const [showCommentBox, setShowCommentBox] = useState( false );
  const [comment, setComment] = useState( "" );
  const showAgree = taxon && user && user.id !== userId && taxon.rank_level <= 10
  && userAgreedId !== taxon?.id;

  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;

  const showNoInternetIcon = accessibilityLabel => (
    <View className="mr-3">
      <IconMaterial
        name="wifi-off"
        size={30}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );

  const onAgreePressed = () => {
    const agreeParams = {
      observation_id: observationUUID,
      taxon_id: taxon?.id,
      body: comment
    };

    onAgree( agreeParams );
    setHideAgreeWithIdSheet( true );
  };

  const openCommentBox = () => setShowCommentBox( true );

  const onCommentAdded = newComment => {
    setComment( newComment );
  };

  const agreeIdSheetDiscardChanges = () => {
    setComment( "" );
    setHideAgreeWithIdSheet( true );
  };

  const onIDAgreePressed = () => {
    setHideAgreeWithIdSheet( false );
  };

  // const renderTaxonImage = () => {
  //   if ( isOnline ) {
  //     if ( isCurrent ) {
  //       return ( <TaxonImage props="opacity-50" uri={Taxon.uri( taxon )} /> );
  //     }
  //     return ( <TaxonImage uri={Taxon.uri( taxon )} /> );
  //   }
  //   return showNoInternetIcon( t( "Taxon-photo-unavailable-without-internet" ) );
  // };

  return (
    <View className="flex-column ml-[15px]">
      <ActivityHeader
        item={item}
        refetchRemoteObservation={refetchRemoteObservation}
        toggleRefetch={toggleRefetch}
      />
      {taxon && (
        <View className="flex-row items-center justify-between mr-[23px]">
          <Pressable
            className="flex-row mb-[13.5px] items-center w-2/3"
            onPress={navToTaxonDetails}
            accessibilityRole="link"
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
          >
            {isOnline
              ? <TaxonImage withdrawn={idWithdrawn} uri={Taxon.uri( taxon )} />
              : showNoInternetIcon( t( "Taxon-photo-unavailable-without-internet" ) )}
            <DisplayTaxonName
              withdrawn={idWithdrawn}
              scientificNameFirst={false}
              taxon={taxon}
              layout="horizontal"
            />
          </Pressable>
          { showAgree && (
            <Pressable
              testID="ActivityItem.AgreeIdButton"
              accessibilityRole="button"
              onPress={() => onIDAgreePressed( )}
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
        hide={hideAgreeWithIdSheet}
        comment={comment}
        openCommentBox={openCommentBox}
        taxon={taxon}
        discardChanges={() => agreeIdSheetDiscardChanges( )}
        handleClose={() => agreeIdSheetDiscardChanges( )}
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
