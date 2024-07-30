// @flow
import { useRoute } from "@react-navigation/native";
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
import React, { useMemo } from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  useSafeAreaInsets
} from "react-native-safe-area-context";
import {
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";

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
  comment: string,
  commentIsOptional: ?boolean,
  confirmCommentFromCommentSheet: Function,
  confirmRemoteObsWasDeleted?: Function,
  currentTabId: string,
  currentUser: Object,
  hideAddCommentSheet: Function,
  isConnected: boolean,
  isRefetching: boolean,
  navToSuggestions: Function,
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
  taxonForSuggestion: ?Object
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
  currentTabId,
  currentUser,
  hideAddCommentSheet,
  isConnected,
  isRefetching,
  navToSuggestions,
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
  taxonForSuggestion
}: Props ): Node => {
  const insets = useSafeAreaInsets();
  const { params } = useRoute( );
  const { uuid } = params;
  const { t } = useTranslation( );
  const currentObservation = useStore( state => state.currentObservation );

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
        observation={observation}
        openAgreeWithIdSheet={openAgreeWithIdSheet}
        refetchRemoteObservation={refetchRemoteObservation}
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
        <Tabs tabs={tabs} activeId={currentTabId} />
        <ScrollView
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
          <Tabs tabs={tabs} activeId={currentTabId} />
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

  const hasComment = !!( comment || currentObservation?.description );

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
      {showAgreeWithIdSheet && (
        <AgreeWithIDSheet
          comment={comment}
          handleClose={closeAgreeWithIdSheet}
          onAgree={onAgree}
          openAddCommentSheet={openAddCommentSheet}
          taxon={taxonForSuggestion}
        />
      )}
      {/* AddCommentSheet */}
      {showAddCommentSheet && (
        <TextInputSheet
          buttonText={t( "CONFIRM" )}
          handleClose={hideAddCommentSheet}
          headerText={showAddCommentHeader( )}
          textInputStyle={textInputStyle}
          initialInput={comment || currentObservation?.description}
          confirm={confirmCommentFromCommentSheet}
        />
      )}
      {showSuggestIdSheet && (
        <SuggestIDSheet
          openAddCommentSheet={openAddCommentSheet}
          handleClose={suggestIdSheetDiscardChanges}
          onSuggestId={onSuggestId}
        />
      )}
      {showPotentialDisagreementSheet && (
        <PotentialDisagreementSheet
          onPotentialDisagreePressed={onPotentialDisagreePressed}
          handleClose={potentialDisagreeSheetDiscardChanges}
          taxon={taxonForSuggestion}
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
