// @flow
import { useNavigation, useRoute } from "@react-navigation/native";
import AgreeWithIDSheet from "components/ObsDetails/Sheets/AgreeWithIDSheet";
import {
  DateDisplay, DisplayTaxon, HideView, InlineUser, ObservationLocation, ScrollViewWrapper, Tabs,
  TextInputSheet
} from "components/SharedComponents";
import ObsStatus from "components/SharedComponents/ObservationsFlashList/ObsStatus";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { ActivityIndicator } from "react-native-paper";
import {
  useTranslation
} from "sharedHooks";

import ActivityTab from "./ActivityTab/ActivityTab";
import FloatingButtons from "./ActivityTab/FloatingButtons";
import DetailsTab from "./DetailsTab/DetailsTab";
import PhotoDisplayContainer from "./PhotoDisplayContainer";

type Props = {
  navToAddID: Function,
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
  showAgreeWithIdSheet: Function,
  openCommentBox: Function,
  agreeIdSheetDiscardChanges: Function,
  onAgree: Function
}

const ObsDetails = ( {
  navToAddID,
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
  onAgree
}: Props ): Node => {
  const { params } = useRoute();
  const { uuid } = params;
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const taxon = observation?.taxon;

  const showTaxon = () => {
    if ( !taxon ) {
      return <Text>{t( "Unknown-organism" )}</Text>;
    }
    return (
      <DisplayTaxon
        taxon={taxon}
        handlePress={( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
        testID={`ObsDetails.taxon.${taxon.id}`}
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
      />
    );
  };

  return (
    <>
      <ScrollViewWrapper testID={`ObsDetails.${uuid}`}>
        {/*
            TODO: react-navigation supports a lot of styling options including
            a transparent header, so this custom header probably is not
            necessary ~~~kueda

            Tried using transparent react-navigation header but had issues where the header
            blocked the Edit button and the header would follow scroll
          */}
        <PhotoDisplayContainer
          observation={observation}
          refetchRemoteObservation={refetchRemoteObservation}
        />
        <View className="flex-row justify-between mx-[15px] mt-[13px]">
          <InlineUser user={observation?.user} />
          <DateDisplay dateString={observation?.created_at} />
        </View>
        <View className="flex-row my-[11px] justify-between mx-3">
          {showTaxon()}
          <ObsStatus layout="vertical" observation={observation} />
        </View>
        <ObservationLocation observation={observation} classNameMargin="ml-3 mb-2" />
        <Tabs tabs={tabs} activeId={currentTabId} />
        <HideView show={showActivityTab}>
          <ActivityTab
            observation={observation}
            refetchRemoteObservation={refetchRemoteObservation}
            onIDAgreePressed={onIDAgreePressed}
            activityItems={activityItems}
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
      </ScrollViewWrapper>
      {showActivityTab && (
        <FloatingButtons
          navToAddID={navToAddID}
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
          snapPoints={[416]}
          confirm={textInput => onCommentAdded( textInput )}
        />
      )}
    </>
  );
};

export default ObsDetails;
