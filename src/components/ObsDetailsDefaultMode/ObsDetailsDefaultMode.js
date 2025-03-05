// @flow
import {
  ActivityIndicator
} from "components/SharedComponents";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useRef
} from "react";
import {
  useScrollToOffset
} from "sharedHooks";

import CommunitySection from "./CommunitySection/CommunitySection";
import FloatingButtons from "./CommunitySection/FloatingButtons";
import CommunityTaxon from "./CommunityTaxon";
import DetailsSection from "./DetailsSection/DetailsSection";
import LocationSection from "./LocationSection/LocationSection";
import MapSection from "./MapSection/MapSection";
import MoreSection from "./MoreSection/MoreSection";
import NotesSection from "./NotesSection/NotesSection";
import ObsDetailsDefaultModeHeaderRight from "./ObsDetailsDefaultModeHeaderRight";
import ObserverDetails from "./ObserverDetails";
import ObsMediaDisplayContainer from "./ObsMediaDisplayContainer";
import StatusSection from "./StatusSection/StatusSection";

type Props = {
  activityItems: Array<Object>,
  addingActivityItem: Function,
  belongsToCurrentUser: boolean,
  currentUser: Object,
  isConnected: boolean,
  isSimpleMode: boolean,
  navToSuggestions: Function,
  observation: Object,
  openAddCommentSheet: Function,
  openAgreeWithIdSheet: Function,
  refetchRemoteObservation: Function,
  refetchSubscriptions: Function,
  showAddCommentSheet: Function,
  subscriptions?: Object,
  targetActivityItemID: number,
  uuid: string
}

const ObsDetailsDefaultMode = ( {
  activityItems = [],
  addingActivityItem,
  belongsToCurrentUser,
  currentUser,
  isConnected,
  isSimpleMode,
  navToSuggestions,
  observation,
  openAddCommentSheet,
  openAgreeWithIdSheet,
  refetchRemoteObservation,
  refetchSubscriptions,
  showAddCommentSheet,
  subscriptions,
  targetActivityItemID,
  uuid
}: Props ): Node => {
  const scrollViewRef = useRef( );

  const {
    setHeightOfContentAboveSection: setHeightOfContentAboveCommunitySection,
    setOffsetToActivityItem
  } = useScrollToOffset( scrollViewRef );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ObsDetailsDefaultModeHeaderRight
        belongsToCurrentUser={belongsToCurrentUser}
        observationId={observation?.id}
        uuid={observation?.uuid}
        refetchSubscriptions={refetchSubscriptions}
        subscriptions={subscriptions}
      />
      <ScrollView
        ref={scrollViewRef}
        testID={`ObsDetails.${uuid}`}
        scrollEventThrottle={16}
      >
        <View
          onLayout={event => {
            const { layout } = event.nativeEvent;
            setHeightOfContentAboveCommunitySection( layout );
          }}
        >
          {!isSimpleMode && (
            <ObserverDetails
              belongsToCurrentUser={belongsToCurrentUser}
              isConnected={isConnected}
              observation={observation}
            />
          )}
          <View>
            <ObsMediaDisplayContainer observation={observation} />
          </View>
          <CommunityTaxon
            belongsToCurrentUser={belongsToCurrentUser}
            observation={observation}
            isSimpleMode
          />
          <View className={isSimpleMode
            ? "mt-[15px]"
            : "mt-5"}
          >
            <MapSection observation={observation} />
          </View>
          <LocationSection
            belongsToCurrentUser={belongsToCurrentUser}
            observation={observation}
          />
          <NotesSection description={observation.description} />
        </View>
        {!isSimpleMode && (
          <>
            <CommunitySection
              activityItems={activityItems}
              isConnected={isConnected}
              targetItemID={targetActivityItemID}
              observation={observation}
              openAgreeWithIdSheet={openAgreeWithIdSheet}
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
          </>
        )}
      </ScrollView>
      {currentUser && (
        <FloatingButtons
          navToSuggestions={navToSuggestions}
          openAddCommentSheet={openAddCommentSheet}
          showAddCommentSheet={showAddCommentSheet}
        />
      )}
    </SafeAreaView>
  );
};

export default ObsDetailsDefaultMode;
