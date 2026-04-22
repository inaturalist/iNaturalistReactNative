// @flow
import FloatingButtons from "components/ObsDetailsSharedComponents/ActivityTab/FloatingButtons";
import ObsMediaDisplayContainer
  from "components/ObsDetailsSharedComponents/Media/ObsMediaDisplayContainer";
import {
  ActivityIndicator,
  HideView,
  Tabs,
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef } from "react";
import DeviceInfo from "react-native-device-info";
import {
  useScrollToOffset,
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
  belongsToCurrentUser: boolean,
  currentUser: Object,
  isConnected: boolean,
  navToSuggestions: Function,
  observation: Object,
  obsDetailsTab: string,
  openAddCommentSheet: Function,
  openAgreeWithIdSheet: Function,
  refetchRemoteObservation: Function,
  refetchSubscriptions: Function,
  showActivityTab: boolean,
  showAddCommentSheet: Function,
  subscriptions?: Object,
  tabs: Object[],
  targetActivityItemID: number,
  uuid: string
}

const ObsDetails = ( {
  activityItems,
  addingActivityItem,
  belongsToCurrentUser,
  currentUser,
  isConnected,
  navToSuggestions,
  observation,
  obsDetailsTab,
  openAddCommentSheet,
  openAgreeWithIdSheet,
  refetchRemoteObservation,
  refetchSubscriptions,
  showActivityTab,
  showAddCommentSheet,
  subscriptions,
  tabs,
  targetActivityItemID,
  uuid,
}: Props ): Node => {
  const scrollViewRef = useRef( );

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

  return (
    <View className="flex-1 bg-black">
      {!isTablet
        ? renderPhone()
        : renderTablet()}
    </View>
  );
};

export default ObsDetails;
