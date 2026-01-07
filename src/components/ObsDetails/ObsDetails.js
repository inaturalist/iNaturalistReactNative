// @flow
import FloatingButtons from "components/ObsDetailsSharedComponents/ActivityTab/FloatingButtons";
import ObsMediaDisplayContainer
  from "components/ObsDetailsSharedComponents/Media/ObsMediaDisplayContainer";
import AgreeWithIDSheet from "components/ObsDetailsSharedComponents/Sheets/AgreeWithIDSheet";
import PotentialDisagreementSheet from
  "components/ObsDetailsSharedComponents/Sheets/PotentialDisagreementSheet";
import SuggestIDSheet from "components/ObsDetailsSharedComponents/Sheets/SuggestIDSheet";
import {
  ActivityIndicator,
  HideView,
  Tabs,
  TextInputSheet,
  WarningSheet,
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  useScrollToOffset,
  useTranslation,
} from "sharedHooks";

import ObsDetailsHeaderRight from "../ObsDetailsDefaultMode/ObsDetailsDefaultModeHeaderRight";
import ActivityTab from "./ActivityTab/ActivityTab";
import DetailsTab from "./DetailsTab/DetailsTab";
import FaveButton from "./FaveButton";
import ObsDetailsOverview from "./ObsDetailsOverview";

const isTablet = DeviceInfo.isTablet();

type Props = {
  activityItems: Object[],
  addingActivityItem: Function,
  closeAgreeWithIdSheet: Function,
  belongsToCurrentUser: boolean,
  comment?: string | null,
  commentIsOptional: ?boolean,
  confirmCommentFromCommentSheet: Function,
  confirmRemoteObsWasDeleted?: Function,
  obsDetailsTab: string,
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
  showActivityTab: boolean,
  showAgreeWithIdSheet: boolean,
  showPotentialDisagreementSheet: boolean,
  showAddCommentSheet: Function,
  showSuggestIdSheet: boolean,
  subscriptions?: Object,
  suggestIdSheetDiscardChanges: Function,
  tabs: Object[],
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

const ObsDetails = ( {
  activityItems,
  addingActivityItem,
  closeAgreeWithIdSheet,
  belongsToCurrentUser,
  comment,
  commentIsOptional,
  confirmCommentFromCommentSheet,
  confirmRemoteObsWasDeleted,
  obsDetailsTab,
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
  showActivityTab,
  showAgreeWithIdSheet,
  showPotentialDisagreementSheet,
  showAddCommentSheet,
  showSuggestIdSheet,
  subscriptions,
  suggestIdSheetDiscardChanges,
  tabs,
  identBodySheetShown,
  onCloseIdentBodySheet,
  newIdentification,
  onChangeIdentBody,
  uuid,
}: Props ): Node => {
  const scrollViewRef = useRef( );
  const { t } = useTranslation( );

  const {
    setHeightOfContentAboveSection: setHeightOfContentAboveActivityTab,
    setOffsetToActivityItem,
  } = useScrollToOffset( scrollViewRef );

  // If the user just added an activity item and we're waiting for it to load,
  // scroll to the bottom where it will be visible. Also provides immediate
  // feedback that the user's action had an effect
  useEffect( ( ) => {
    if ( addingActivityItem ) {
      scrollViewRef?.current?.scrollToEnd( );
    }
  }, [addingActivityItem] );
  const textInputStyle = Platform.OS === "android" && {
    height: 125,
  };

  const renderActivityTab = ( ) => (
    <HideView show={showActivityTab}>
      <ActivityTab
        activityItems={activityItems}
        isConnected={isConnected}
        targetItemID={targetActivityItemID}
        observation={observation}
        openAgreeWithIdSheet={openAgreeWithIdSheet}
        refetchRemoteObservation={refetchRemoteObservation}
        onLayoutTargetItem={setOffsetToActivityItem}
      />
    </HideView>
  );

  const renderDetailsTab = ( ) => (
    <HideView noInitialRender show={!showActivityTab}>
      <DetailsTab
        currentUser={currentUser}
        observation={observation}
      />
    </HideView>
  );

  const renderHeaderRight = ( ) => (
    <ObsDetailsHeaderRight
      belongsToCurrentUser={belongsToCurrentUser}
      observationId={observation?.id}
      uuid={observation?.uuid}
      refetchSubscriptions={refetchSubscriptions}
      subscriptions={subscriptions}
    />
  );

  const renderTablet = () => (
    <View className="flex-1 flex-row bg-white">
      <View className="w-[33%]">
        <ObsMediaDisplayContainer observation={observation} tablet />
        {currentUser && (
          <FaveButton
            observation={observation}
            currentUser={currentUser}
            afterToggleFave={refetchRemoteObservation}
            top
          />
        )}
      </View>
      <View className="w-[66%]">
        <View className="mr-8">
          <ObsDetailsOverview
            belongsToCurrentUser={belongsToCurrentUser}
            isConnected={isConnected}
            observation={observation}
          />
        </View>
        <Tabs tabs={tabs} activeId={obsDetailsTab} />
        <ScrollView
          ref={scrollViewRef}
          testID={`ObsDetails.${uuid}`}
          stickyHeaderIndices={[0, 3]}
          scrollEventThrottle={16}
          className="flex-1 flex-column"
          stickyHeaderHiddenOnScroll
          endFillColor="white"
        >
          <View
            onLayout={event => {
              const { layout } = event.nativeEvent;
              setHeightOfContentAboveActivityTab( layout );
            }}
          />
          <View className="bg-white h-full">
            {renderActivityTab( )}
            {renderDetailsTab( )}
            {addingActivityItem && (
              <View className="flex-row items-center justify-center p-10">
                <ActivityIndicator size={50} />
              </View>
            )}
          </View>
        </ScrollView>
        {showActivityTab && (
          <FloatingButtons
            navToSuggestions={navToSuggestions}
            openAddCommentSheet={openAddCommentSheet}
            showAddCommentSheet={showAddCommentSheet}
          />
        )}
      </View>
      {renderHeaderRight( )}
    </View>
  );

  const renderPhone = () => (
    <>
      <ScrollView
        ref={scrollViewRef}
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[0, 3]}
        scrollEventThrottle={16}
        endFillColor="white"
      >
        {renderHeaderRight( )}
        <View
          onLayout={event => {
            const { layout } = event.nativeEvent;
            setHeightOfContentAboveActivityTab( layout );
          }}
        >
          <View>
            <ObsMediaDisplayContainer observation={observation} />
            { currentUser && (
              <FaveButton
                observation={observation}
                currentUser={currentUser}
                afterToggleFave={refetchRemoteObservation}
              />
            ) }
          </View>
          <ObsDetailsOverview
            belongsToCurrentUser={belongsToCurrentUser}
            isConnected={isConnected}
            observation={observation}
          />
          <View className="bg-white">
            <Tabs tabs={tabs} activeId={obsDetailsTab} />
          </View>
        </View>
        <View className="bg-white h-full">
          {renderActivityTab( )}
          {renderDetailsTab( )}
          {addingActivityItem && (
            <View className="flex-row items-center justify-center p-10">
              <ActivityIndicator size={50} />
            </View>
          )}
        </View>
      </ScrollView>
      {showActivityTab && currentUser && (
        <FloatingButtons
          navToSuggestions={navToSuggestions}
          openAddCommentSheet={openAddCommentSheet}
          showAddCommentSheet={showAddCommentSheet}
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
    <View className="flex-1 bg-black">
      {!isTablet
        ? renderPhone()
        : renderTablet()}
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
    </View>
  );
};

export default ObsDetails;
