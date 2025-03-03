// @flow
import PotentialDisagreementSheet from
  "components/ObsDetails/Sheets/PotentialDisagreementSheet";
import {
  ActivityIndicator,
  TextInputSheet,
  WarningSheet
} from "components/SharedComponents";
import EmailConfirmationSheet from "components/SharedComponents/Sheets/EmailConfirmationSheet";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useEffect,
  useRef,
  useState
} from "react";
import { Platform } from "react-native";
import useIsUserConfirmed from "sharedHooks/useIsUserConfirmed";

import CommunitySection from "./CommunitySection/CommunitySection";
import FloatingButtons from "./CommunitySection/FloatingButtons";
import CommunityTaxon from "./CommunityTaxon";
import DetailsSection from "./DetailsSection/DetailsSection";
import LocationSection from "./LocationSection/LocationSection";
import MapSection from "./MapSection/MapSection";
import MoreSection from "./MoreSection/MoreSection";
import NotesSection from "./NotesSection/NotesSection";
import ObsDetailsHeaderRight from "./ObsDetailsDefaultModeHeaderRight";
import ObserverDetails from "./ObserverDetails";
import ObsMediaDisplayContainer from "./ObsMediaDisplayContainer";
import AgreeWithIDSheet from "./Sheets/AgreeWithIDSheet";
import SuggestIDSheet from "./Sheets/SuggestIDSheet";
import StatusSection from "./StatusSection/StatusSection";

type Props = {
  activityItems: Array<Object>,
  addingActivityItem: Function,
  closeAgreeWithIdSheet: Function,
  belongsToCurrentUser: boolean,
  comment?: string | null,
  commentIsOptional: ?boolean,
  confirmCommentFromCommentSheet: Function,
  confirmRemoteObsWasDeleted?: Function,
  currentUser: Object,
  editIdentBody: Function,
  hideAddCommentSheet: Function,
  isConnected: boolean,
  navToSuggestions: Function,
  targetActivityItemID: number,
  observation: Object,
  openAddCommentSheet: Function,
  openAgreeWithIdSheet: Function,
  onAgree: Function,
  onSuggestId: Function,
  onPotentialDisagreePressed: Function,
  potentialDisagreeSheetDiscardChanges: Function,
  refetchRemoteObservation: Function,
  refetchSubscriptions: Function,
  remoteObsWasDeleted?: boolean,
  showAgreeWithIdSheet: boolean,
  showPotentialDisagreementSheet: boolean,
  showAddCommentSheet: Function,
  showSuggestIdSheet: boolean,
  subscriptions?: Object,
  suggestIdSheetDiscardChanges: Function,
  identBodySheetShown?: boolean,
  onCloseIdentBodySheet?: Function,
  newIdentification?: null | {
    body?: string,
    taxon: Object,
    vision?: boolean
  },
  onChangeIdentBody?: Function,
  uuid: string
}

const ObsDetailsDefaultMode = ( {
  activityItems,
  addingActivityItem,
  closeAgreeWithIdSheet,
  belongsToCurrentUser,
  comment,
  commentIsOptional,
  confirmCommentFromCommentSheet,
  confirmRemoteObsWasDeleted,
  currentUser,
  editIdentBody,
  hideAddCommentSheet,
  isConnected,
  navToSuggestions,
  targetActivityItemID,
  observation,
  onAgree,
  openAgreeWithIdSheet,
  onSuggestId,
  onPotentialDisagreePressed,
  openAddCommentSheet,
  potentialDisagreeSheetDiscardChanges,
  refetchRemoteObservation,
  refetchSubscriptions,
  remoteObsWasDeleted,
  showAgreeWithIdSheet,
  showPotentialDisagreementSheet,
  showAddCommentSheet,
  showSuggestIdSheet,
  subscriptions,
  suggestIdSheetDiscardChanges,
  identBodySheetShown,
  onCloseIdentBodySheet,
  newIdentification,
  onChangeIdentBody,
  uuid
}: Props ): Node => {
  const scrollViewRef = useRef( );
  // Scroll the scrollview to this y position once if set, then unset it.
  // Could be refactored into a hook if we need this logic elsewher
  const [oneTimeScrollOffsetY, setOneTimeScrollOffsetY] = useState( 0 );
  const [heightOfTopContent, setHeightOfTopContent] = useState( 0 );
  const isUserConfirmed = useIsUserConfirmed();
  const [showUserNeedToConfirm, setShowUserNeedToConfirm] = useState( false );

  useEffect( ( ) => {
    if ( oneTimeScrollOffsetY && scrollViewRef?.current ) {
      scrollViewRef?.current?.scrollTo( { y: oneTimeScrollOffsetY } );
      setOneTimeScrollOffsetY( 0 );
      setHeightOfTopContent( 0 );
    }
  }, [oneTimeScrollOffsetY] );

  const callFunctionIfConfirmedEmail = ( func, params = {} ) => {
    // Allow the user to add a comment, suggest an ID, etc.  - only if they've
    // confirmed their email or if they're the observer of this observation
    if ( isUserConfirmed || belongsToCurrentUser ) {
      if ( func ) func( params );
      return true;
    }
    // Show the user the bottom sheet that tells them they need to confirm
    setShowUserNeedToConfirm( true );
    return false;
  };

  // If the user just added an activity item and we're waiting for it to load,
  // scroll to the bottom where it will be visible. Also provides immediate
  // feedback that the user's action had an effect
  useEffect( ( ) => {
    if ( addingActivityItem ) {
      scrollViewRef?.current?.scrollToEnd( );
    }
  }, [addingActivityItem] );

  const textInputStyle = Platform.OS === "android" && {
    height: 125
  };

  const setOffsetToActivityItem = e => {
    const { layout } = e.nativeEvent;
    const newOffset = layout.y + layout.height + heightOfTopContent;
    setOneTimeScrollOffsetY( newOffset );
  };

  const setHeightOfContentAboveCommunitySection = e => {
    const { layout } = e.nativeEvent;
    const newOffset = layout.height;
    setHeightOfTopContent( newOffset );
  };

  const renderScrollview = ( ) => (
    <>
      <ObsDetailsHeaderRight
        belongsToCurrentUser={belongsToCurrentUser}
        observationId={observation?.id}
        uuid={observation?.uuid}
        refetchSubscriptions={refetchSubscriptions}
        subscriptions={subscriptions}
        setShowUserNeedToConfirm={setShowUserNeedToConfirm}
        isUserConfirmed={isUserConfirmed}
      />
      <ScrollView
        ref={scrollViewRef}
        testID={`ObsDetails.${uuid}`}
        scrollEventThrottle={16}
      >
        <View
          onLayout={setHeightOfContentAboveCommunitySection}
        >
          <ObserverDetails
            belongsToCurrentUser={belongsToCurrentUser}
            isConnected={isConnected}
            observation={observation}
          />
          <View>
            <ObsMediaDisplayContainer observation={observation} />
          </View>
          <CommunityTaxon
            belongsToCurrentUser={belongsToCurrentUser}
            observation={observation}
          />
          <View className="mt-5">
            <MapSection observation={observation} />
          </View>
          <LocationSection
            belongsToCurrentUser={belongsToCurrentUser}
            observation={observation}
          />
        </View>
        <NotesSection description={observation.description} />
        <CommunitySection
          activityItems={activityItems}
          isConnected={isConnected}
          targetItemID={targetActivityItemID}
          observation={observation}
          openAgreeWithIdSheet={
            params => callFunctionIfConfirmedEmail( openAgreeWithIdSheet, params )
          }
          refetchRemoteObservation={refetchRemoteObservation}
          onLayoutTargetItem={setOffsetToActivityItem}
        />
        {addingActivityItem && (
          <View className="flex-row items-center justify-center p-10">
            <ActivityIndicator size={50} />
          </View>
        )}
        <StatusSection observation={observation} />
        <DetailsSection observation={observation} />
        <MoreSection observation={observation} />
      </ScrollView>
      {currentUser && (
        <FloatingButtons
          showAddCommentSheet={showAddCommentSheet}
          navToSuggestions={() => callFunctionIfConfirmedEmail(
            navToSuggestions
          )}
          openAddCommentSheet={
            params => callFunctionIfConfirmedEmail( openAddCommentSheet, params )
          }
        />
      )}
    </>
  );

  const hasComment = ( comment || newIdentification?.body || "" ).length > 0;

  const showAddCommentHeader = ( ) => {
    if ( hasComment ) {
      return t( "EDIT-COMMENT" );
    } if ( commentIsOptional ) {
      return t( "ADD-OPTIONAL-COMMENT" );
    }
    return t( "ADD-COMMENT" );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
    >
      {renderScrollview( )}
      {showAgreeWithIdSheet && newIdentification && (
        <AgreeWithIDSheet
          onAgree={onAgree}
          editIdentBody={editIdentBody}
          hidden={identBodySheetShown}
          onPressClose={closeAgreeWithIdSheet}
          identification={newIdentification}
        />
      )}
      {/* AddCommentSheet */}
      {showAddCommentSheet && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          onPressClose={hideAddCommentSheet}
          headerText={showAddCommentHeader( )}
          textInputStyle={textInputStyle}
          initialInput={comment}
          confirm={confirmCommentFromCommentSheet}
        />
      )}
      {identBodySheetShown && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          onPressClose={onCloseIdentBodySheet}
          headerText={showAddCommentHeader( )}
          textInputStyle={textInputStyle}
          initialInput={newIdentification?.body}
          confirm={onChangeIdentBody}
        />
      )}
      {showSuggestIdSheet && (
        <SuggestIDSheet
          editIdentBody={editIdentBody}
          hidden={identBodySheetShown}
          onPressClose={suggestIdSheetDiscardChanges}
          onSuggestId={onSuggestId}
          identification={newIdentification}
        />
      )}
      {showPotentialDisagreementSheet && newIdentification && (
        <PotentialDisagreementSheet
          onPotentialDisagreePressed={onPotentialDisagreePressed}
          onPressClose={potentialDisagreeSheetDiscardChanges}
          newTaxon={newIdentification.taxon}
          oldTaxon={observation.taxon}
        />
      )}
      {showUserNeedToConfirm && (
        <EmailConfirmationSheet
          onPressClose={() => setShowUserNeedToConfirm( false )}
        />
      )}
      {/*
        * FWIW, some situations in which this could happen are
        * 1. User loaded obs in explore and it was deleted between then and
          when they tapped on it
        * 2. Some process fetched observations between when they were deleted
          and the search index was updated to reflect that
        *
      */}
      { remoteObsWasDeleted && confirmRemoteObsWasDeleted && (
        <WarningSheet
          onPressClose={confirmRemoteObsWasDeleted}
          headerText={t( "OBSERVATION-WAS-DELETED" )}
          text={t( "Sorry-this-observation-was-deleted" )}
          buttonText={t( "OK" )}
          confirm={confirmRemoteObsWasDeleted}
        />
      ) }
    </SafeAreaView>
  );
};

export default ObsDetailsDefaultMode;
