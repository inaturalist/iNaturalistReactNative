// @flow
import { useRoute } from "@react-navigation/native";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import {
  HideView, Tabs,
  TextInputSheet
} from "components/SharedComponents";
import { SafeAreaView, ScrollView, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform, StatusBar } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import {
  useTranslation
} from "sharedHooks";

import ActivityTab from "./ActivityTab/ActivityTab";
import FloatingButtons from "./ActivityTab/FloatingButtons";
import DetailsTab from "./DetailsTab/DetailsTab";
import ObsDetailsHeader from "./ObsDetailsHeader";
import PhotoDisplayContainer from "./PhotoDisplayContainer";

type Props = {
  navToSuggestions: Function,
  onCommentAdded: Function,
  openCommentBox: Function,
  tabs: Array<Object>,
  currentTabId: string,
  showCommentBox: Function,
  addingActivityItem: Function,
  observation: Object,
  refetchRemoteObservation: Function,
  hideCommentBox: Function,
  activityItems: Array<Object>,
  showActivityTab: boolean,
  onIDAgreePressed: Function,
  showAgreeWithIdSheet: boolean,
  openCommentBox: Function,
  agreeIdSheetDiscardChanges: Function,
  onAgree: Function,
  isOnline: boolean,
  belongsToCurrentUser: boolean
}

const ObsDetails = ( {
  navToSuggestions,
  onCommentAdded,
  openCommentBox,
  tabs,
  currentTabId,
  showCommentBox,
  addingActivityItem,
  observation,
  refetchRemoteObservation,
  hideCommentBox,
  onIDAgreePressed,
  activityItems,
  showActivityTab,
  showAgreeWithIdSheet,
  agreeIdSheetDiscardChanges,
  onAgree,
  isOnline,
  belongsToCurrentUser
}: Props ): Node => {
  const { params } = useRoute( );
  const { uuid } = params;
  const { t } = useTranslation( );

  const taxon = observation?.taxon;

  const textInputStyle = Platform.OS === "android" && {
    height: 125
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[2]}
        scrollEventThrottle={16}
        className="bg-white"
      >
        <PhotoDisplayContainer
          observation={observation}
          refetchRemoteObservation={refetchRemoteObservation}
          isOnline={isOnline}
          belongsToCurrentUser={belongsToCurrentUser}
        />
        <ObsDetailsHeader
          observation={observation}
          isOnline={isOnline}
        />
        <View className="bg-white">
          <Tabs tabs={tabs} activeId={currentTabId} />
        </View>
        <HideView show={showActivityTab}>
          <ActivityTab
            observation={observation}
            refetchRemoteObservation={refetchRemoteObservation}
            onIDAgreePressed={onIDAgreePressed}
            activityItems={activityItems}
            isOnline={isOnline}
          />
        </HideView>
        <HideView noInitialRender show={!showActivityTab}>
          <DetailsTab observation={observation} uuid={uuid} />
        </HideView>
        {addingActivityItem && (
          <View className="flex-row items-center justify-center">
            <ActivityIndicator size="large" />
          </View>
        )}
      </ScrollView>
      {showActivityTab && (
        <FloatingButtons
          navToSuggestions={navToSuggestions}
          openCommentBox={openCommentBox}
          showCommentBox={showCommentBox}
        />
      )}
      {showAgreeWithIdSheet && (
        <AgreeWithIDSheet
          taxon={taxon}
          handleClose={( ) => agreeIdSheetDiscardChanges( )}
          onAgree={onAgree}
        />
      )}
      {/* AddCommentSheet */}
      {showCommentBox && (
        <TextInputSheet
          handleClose={hideCommentBox}
          headerText={t( "ADD-OPTIONAL-COMMENT" )}
          textInputStyle={textInputStyle}
          confirm={textInput => onCommentAdded( textInput )}
        />
      )}
    </SafeAreaView>
  );
};

export default ObsDetails;
