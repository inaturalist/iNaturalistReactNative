// @flow
import PotentialDisagreementSheet from
  "components/ObsDetails/Sheets/PotentialDisagreementSheet";
import {
  ActivityIndicator,
  HideView,
  Tabs,
  TextInputSheet,
  WarningSheet
} from "components/SharedComponents";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useLayoutEffect, useMemo, useRef, useState
} from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  useSafeAreaInsets
} from "react-native-safe-area-context";
import {
  useTranslation
} from "sharedHooks";

import ActivityTab from "./ActivityTab/ActivityTab";
import FloatingButtons from "./ActivityTab/FloatingButtons";
import DetailsTab from "./DetailsTab/DetailsTab";
import FaveButton from "./FaveButton";
import ObsDetailsHeader from "./ObsDetailsHeader";
import ObsDetailsOverview from "./ObsDetailsOverview";
import ObsMediaDisplayContainer from "./ObsMediaDisplayContainer";
import AgreeWithIDSheet from "./Sheets/AgreeWithIDSheet";
import SuggestIDSheet from "./Sheets/SuggestIDSheet";

const isTablet = DeviceInfo.isTablet();

type Props = {
  activityItems: Array<Object>,
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
  isRefetching: boolean,
  navToSuggestions: Function,
  notificationId: number,
  observation: Object,
  openAddCommentSheet: Function,
  openAgreeWithIdSheet: Function,
  onAgree: Function,
  onSuggestId: Function,
  onPotentialDisagreePressed: Function,
  potentialDisagreeSheetDiscardChanges: Function,
  refetchRemoteObservation: Function,
  remoteObsWasDeleted?: boolean,
  showActivityTab: boolean,
  showAgreeWithIdSheet: boolean,
  showPotentialDisagreementSheet: boolean,
  showAddCommentSheet: Function,
  showSuggestIdSheet: boolean,
  suggestIdSheetDiscardChanges: Function,
  tabs: Array<Object>,
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
  isRefetching,
  navToSuggestions,
  notificationId,
  observation,
  onAgree,
  openAgreeWithIdSheet,
  onSuggestId,
  onPotentialDisagreePressed,
  openAddCommentSheet,
  potentialDisagreeSheetDiscardChanges,
  refetchRemoteObservation,
  remoteObsWasDeleted,
  showActivityTab,
  showAgreeWithIdSheet,
  showPotentialDisagreementSheet,
  showAddCommentSheet,
  showSuggestIdSheet,
  suggestIdSheetDiscardChanges,
  tabs,
  identBodySheetShown,
  onCloseIdentBodySheet,
  newIdentification,
  onChangeIdentBody,
  uuid
}: Props ): Node => {
  const scrollViewRef = useRef( );
  const insets = useSafeAreaInsets();
  const { t } = useTranslation( );
  const [scrollToY, setScrollToY] = useState( 0 );

  useLayoutEffect( ( ) => {
    // we need useLayoutEffect here to make sure the ScrollView has already rendered
    // before trying to scroll to the relevant activity item
    if ( notificationId && scrollViewRef?.current ) {
      scrollViewRef?.current?.scrollTo( { y: scrollToY } );
    }
  } );

  const dynamicInsets = useMemo( () => ( {
    backgroundColor: "#ffffff",
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right
  } ), [insets] );

  const textInputStyle = Platform.OS === "android" && {
    height: 125
  };

  const renderActivityTab = ( ) => (
    <HideView show={showActivityTab}>
      <ActivityTab
        activityItems={activityItems}
        isConnected={isConnected}
        notificationId={notificationId}
        observation={observation}
        openAgreeWithIdSheet={openAgreeWithIdSheet}
        refetchRemoteObservation={refetchRemoteObservation}
        setScrollToY={setScrollToY}
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
            isRefetching={isRefetching}
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
      <ObsDetailsHeader
        belongsToCurrentUser={belongsToCurrentUser}
        observationId={observation?.id}
        rightIconBlack
        uuid={observation?.uuid}
      />
    </View>
  );

  const renderPhone = () => (
    <>
      <ScrollView
        ref={scrollViewRef}
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[0, 3]}
        scrollEventThrottle={16}
        className="flex-1 flex-column"
        stickyHeaderHiddenOnScroll
        endFillColor="white"
      >
        <ObsDetailsHeader
          belongsToCurrentUser={belongsToCurrentUser}
          observationId={observation?.id}
          uuid={observation?.uuid}
        />
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
          isRefetching={isRefetching}
          observation={observation}
        />
        <View className="bg-white">
          <Tabs tabs={tabs} activeId={obsDetailsTab} />
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
    <SafeAreaView
      className="flex-1 bg-black"
      style={[dynamicInsets]}
    >
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
          handleClose={hideAddCommentSheet}
          headerText={showAddCommentHeader( )}
          textInputStyle={textInputStyle}
          initialInput={comment}
          confirm={confirmCommentFromCommentSheet}
        />
      )}
      {identBodySheetShown && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          handleClose={onCloseIdentBodySheet}
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
          handleClose={potentialDisagreeSheetDiscardChanges}
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
          handleClose={confirmRemoteObsWasDeleted}
          headerText={t( "OBSERVATION-WAS-DELETED" )}
          text={t( "Sorry-this-observation-was-deleted" )}
          buttonText={t( "OK" )}
          confirm={confirmRemoteObsWasDeleted}
        />
      ) }
    </SafeAreaView>
  );
};

export default ObsDetails;
