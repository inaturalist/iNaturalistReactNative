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
import CommunityTaxon from "./CommunityTaxon";
import DetailsTab from "./DetailsTab/DetailsTab";
import PhotoDisplayContainer from "./PhotoDisplayContainer";

type Props = {
  activityItems: Array<Object>,
  addingActivityItem: Function,
  agreeIdSheetDiscardChanges: Function,
  belongsToCurrentUser: boolean,
  currentTabId: string,
  hideCommentBox: Function,
  isOnline: boolean,
  navToSuggestions: Function,
  observation: Object,
  onAgree: Function,
  onCommentAdded: Function,
  onIDAgreePressed: Function,
  openCommentBox: Function,
  openCommentBox: Function,
  refetchRemoteObservation: Function,
  showActivityTab: boolean,
  showAgreeWithIdSheet: boolean,
  showCommentBox: Function,
  tabs: Array<Object>,
  taxonForAgreement: ?Object
}

const ObsDetails = ( {
  activityItems,
  addingActivityItem,
  agreeIdSheetDiscardChanges,
  belongsToCurrentUser,
  currentTabId,
  hideCommentBox,
  isOnline,
  navToSuggestions,
  observation,
  onAgree,
  onCommentAdded,
  onIDAgreePressed,
  openCommentBox,
  refetchRemoteObservation,
  showActivityTab,
  showAgreeWithIdSheet,
  showCommentBox,
  tabs,
  taxonForAgreement
}: Props ): Node => {
  const { params } = useRoute( );
  const { uuid } = params;
  const { t } = useTranslation( );

  const textInputStyle = Platform.OS === "android" && {
    height: 125
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <ScrollView
        testID={`ObsDetails.${uuid}`}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
        className="bg-white"
      >
        <PhotoDisplayContainer
          observation={observation}
          refetchRemoteObservation={refetchRemoteObservation}
          isOnline={isOnline}
          belongsToCurrentUser={belongsToCurrentUser}
        />
        <CommunityTaxon
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
        <View className="pb-64" />
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
          taxon={taxonForAgreement}
          handleClose={agreeIdSheetDiscardChanges}
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
