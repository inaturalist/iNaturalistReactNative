// @flow
import {
  ActivityIndicator
} from "components/SharedComponents";
import EmailConfirmationSheet from "components/SharedComponents/Sheets/EmailConfirmationSheet";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useRef, useState
} from "react";
import {
  useScrollToOffset
} from "sharedHooks";
import useIsUserConfirmed from "sharedHooks/useIsUserConfirmed";

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
  const isUserConfirmed = useIsUserConfirmed();
  const [showUserNeedToConfirm, setShowUserNeedToConfirm] = useState( false );

  const {
    setHeightOfContentAboveSection: setHeightOfContentAboveCommunitySection,
    setOffsetToActivityItem
  } = useScrollToOffset( scrollViewRef );

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ObsDetailsDefaultModeHeaderRight
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
          onLayout={event => {
            const { layout } = event.nativeEvent;
            setHeightOfContentAboveCommunitySection( layout );
          }}
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
          <NotesSection description={observation.description} />
        </View>
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
      {showUserNeedToConfirm && (
        <EmailConfirmationSheet
          onPressClose={() => setShowUserNeedToConfirm( false )}
        />
      )}
    </SafeAreaView>
  );
};

export default ObsDetailsDefaultMode;
