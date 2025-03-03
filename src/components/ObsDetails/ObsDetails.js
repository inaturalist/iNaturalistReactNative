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
import EmailConfirmationSheet from "components/SharedComponents/Sheets/EmailConfirmationSheet";
import {
  SafeAreaView,
  ScrollView,
  View
} from "components/styledComponents";
import type { Node } from "react";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  useSafeAreaInsets
} from "react-native-safe-area-context";
import {
  useTranslation
} from "sharedHooks";
import useIsUserConfirmed from "sharedHooks/useIsUserConfirmed";

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
  uuid
}: Props ): Node => {
  const scrollViewRef = useRef( );
  const insets = useSafeAreaInsets();
  const { t } = useTranslation( );
  const [invertToWhiteBackground, setInvertToWhiteBackground] = useState( false );
  const isUserConfirmed = useIsUserConfirmed();
  const [showUserNeedToConfirm, setShowUserNeedToConfirm] = useState( false );

  // Scroll the scrollview to this y position once if set, then unset it.
  // Could be refactored into a hook if we need this logic elsewher
  const [oneTimeScrollOffsetY, setOneTimeScrollOffsetY] = useState( 0 );
  useEffect( ( ) => {
    if ( oneTimeScrollOffsetY && scrollViewRef?.current ) {
      scrollViewRef?.current?.scrollTo( { y: oneTimeScrollOffsetY } );
      setOneTimeScrollOffsetY( 0 );
    }
  }, [oneTimeScrollOffsetY] );

  // If the user just added an activity item and we're waiting for it to load,
  // scroll to the bottom where it will be visible. Also provides immediate
  // feedback that the user's action had an effect
  useEffect( ( ) => {
    if ( addingActivityItem ) {
      scrollViewRef?.current?.scrollToEnd( );
    }
  }, [addingActivityItem] );

  const handleScroll = e => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const shouldInvert = !!( scrollY > 150 );
    if ( shouldInvert !== invertToWhiteBackground ) {
      setInvertToWhiteBackground( shouldInvert );
    }
  };

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
        targetItemID={targetActivityItemID}
        observation={observation}
        openAgreeWithIdSheet={
          params => callFunctionIfConfirmedEmail( openAgreeWithIdSheet, params )
        }
        refetchRemoteObservation={refetchRemoteObservation}
        onLayoutTargetItem={event => {
          const { layout } = event.nativeEvent;
          setOneTimeScrollOffsetY( layout.y + layout.height );
        }}
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
            beforeToggleFave={callFunctionIfConfirmedEmail}
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
          onScroll={handleScroll}
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
            navToSuggestions={() => callFunctionIfConfirmedEmail(
              navToSuggestions
            )}
            openAddCommentSheet={
              params => callFunctionIfConfirmedEmail( openAddCommentSheet, params )
            }
            showAddCommentSheet={showAddCommentSheet}
          />
        )}
      </View>
      <ObsDetailsHeader
        belongsToCurrentUser={belongsToCurrentUser}
        invertToWhiteBackground={invertToWhiteBackground}
        observationId={observation?.id}
        rightIconDarkGray
        uuid={observation?.uuid}
        refetchSubscriptions={refetchSubscriptions}
        subscriptions={subscriptions}
        setShowUserNeedToConfirm={setShowUserNeedToConfirm}
        isUserConfirmed={isUserConfirmed}
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
        endFillColor="white"
        onScroll={handleScroll}
      >
        <ObsDetailsHeader
          belongsToCurrentUser={belongsToCurrentUser}
          subscriptions={subscriptions}
          invertToWhiteBackground={invertToWhiteBackground}
          observationId={observation?.id}
          uuid={observation?.uuid}
          refetchSubscriptions={refetchSubscriptions}
          setShowUserNeedToConfirm={setShowUserNeedToConfirm}
          isUserConfirmed={isUserConfirmed}
        />
        <View className="-mt-[64px]">
          <ObsMediaDisplayContainer observation={observation} />
          { currentUser && (
            <FaveButton
              observation={observation}
              currentUser={currentUser}
              beforeToggleFave={callFunctionIfConfirmedEmail}
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
          navToSuggestions={() => callFunctionIfConfirmedEmail(
            navToSuggestions
          )}
          openAddCommentSheet={
            params => callFunctionIfConfirmedEmail( openAddCommentSheet, params )
          }
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

export default ObsDetails;
