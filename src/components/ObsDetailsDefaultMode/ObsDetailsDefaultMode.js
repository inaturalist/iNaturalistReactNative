// @flow
import {
  ActivityIndicator
} from "components/SharedComponents";
import { ScrollView, View } from "components/styledComponents";
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

const cardClassBottom = "rounded-b-2xl border-lightGray border-[2px] pb-3 border-t-0 -mt-0.5 mb-4";

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
  targetActivityItemID: ?number,
  wasSynced: boolean,
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
  wasSynced,
  uuid
}: Props ): Node => {
  const scrollViewRef = useRef( );

  const {
    setHeightOfContentAboveSection: setHeightOfContentAboveCommunitySection,
    setOffsetToActivityItem
  } = useScrollToOffset( scrollViewRef );

  const isSavedObservationByCurrentUser = belongsToCurrentUser && !wasSynced;

  // floating buttons should show when you're logged in for your observations
  // as well as other's observations. they should not show if it's your own saved observation
  const showFloatingButtons = currentUser && !isSavedObservationByCurrentUser;

  return (
    <View className="flex-1 bg-white">
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
          {!isSimpleMode && <View className={cardClassBottom} />}
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
      {showFloatingButtons && (
        <FloatingButtons
          navToSuggestions={navToSuggestions}
          openAddCommentSheet={openAddCommentSheet}
          showAddCommentSheet={showAddCommentSheet}
        />
      )}
    </View>
  );
};

export default ObsDetailsDefaultMode;
