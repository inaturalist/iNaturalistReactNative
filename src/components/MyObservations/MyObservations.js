// @flow
import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import MyObservationsHeader from "components/MyObservations/MyObservationsHeader";
import ObservationsFlashList from "components/ObservationsFlashList/ObservationsFlashList";
import OnboardingCarouselModal from "components/Onboarding/OnboardingCarouselModal";
import {
  Heading2,
  ScrollableWithStickyHeader,
  ViewWrapper
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import Modal from "components/SharedComponents/Modal.tsx";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { useOnboardingShown } from "sharedHelpers/installData.ts";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import Announcements from "./Announcements";
import LoginSheet from "./LoginSheet";

type Props = {
  currentUser: Object,
  handleIndividualUploadPress: Function,
  handleSyncButtonPress: Function,
  handlePullToRefresh: Function,
  isConnected: boolean,
  isFetchingNextPage: boolean,
  layout: "list" | "grid",
  listRef?: Object,
  numUnuploadedObservations: number,
  observations: Array<Object>,
  onEndReached: Function,
  onListLayout?: Function,
  onScroll?: Function,
  setShowLoginSheet: Function,
  showLoginSheet: boolean,
  showNoResults: boolean,
  toggleLayout: Function
};

const MyObservations = ( {
  currentUser,
  handleIndividualUploadPress,
  handleSyncButtonPress,
  handlePullToRefresh,
  isConnected,
  isFetchingNextPage,
  layout,
  listRef,
  numUnuploadedObservations,
  observations,
  onEndReached,
  onListLayout,
  onScroll,
  setShowLoginSheet,
  showLoginSheet,
  showNoResults,
  toggleLayout
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [onboardingShown, setOnboardingShown] = useOnboardingShown( );
  const [showModal, setShowModal] = useState( false );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const navAndCloseModal = ( screen, params ) => {
    if ( screen !== "ObsEdit" ) {
      resetObservationFlowSlice( );
    }
    navigation.navigate( "NoBottomTabStackNavigator", {
      screen,
      params
    } );
    setShowModal( false );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AI" } ); };

  if ( !currentUser && observations.length === 0 ) {
    return (
      <ViewWrapper>
        <OnboardingCarouselModal
          showModal={!onboardingShown}
          closeModal={() => setOnboardingShown( true )}
        />
        <MyObservationsHeader
          currentUser={currentUser}
          handleSyncButtonPress={handleSyncButtonPress}
          hideToolbar={observations.length === 0}
          layout={layout}
          logInButtonNeutral={observations.length === 0}
          numUnuploadedObservations={numUnuploadedObservations}
          toggleLayout={toggleLayout}
        />
        <View className="flex grow flex-col justify-center">
          <GradientButton
            accessibilityLabel={t( "Add-observations" )}
            sizeClassName="w-[141px] h-[141px] self-center"
            onPress={navToARCamera}
            iconSize={76}
          />
          <Pressable accessibilityRole="button" onPress={navToARCamera}>
            <Heading2 className="mt-6 text-center">
              {t( "Identify-an-organism-with-the-iNaturalist-AI-Camera" )}
            </Heading2>
          </Pressable>
        </View>
        <Modal
          showModal={showModal}
          closeModal={( ) => setShowModal( false )}
          modal={(
            <AddObsModal
              closeModal={( ) => setShowModal( false )}
              navAndCloseModal={navAndCloseModal}
            />
          )}
        />
      </ViewWrapper>
    );
  }

  return (
    <>
      <ViewWrapper>
        <OnboardingCarouselModal
          showModal={!onboardingShown}
          closeModal={() => setOnboardingShown( true )}
        />
        <ScrollableWithStickyHeader
          onScroll={onScroll}
          renderHeader={setStickyAt => (
            <MyObservationsHeader
              currentUser={currentUser}
              handleSyncButtonPress={handleSyncButtonPress}
              hideToolbar={observations.length === 0}
              layout={layout}
              logInButtonNeutral={observations.length === 0}
              numUnuploadedObservations={numUnuploadedObservations}
              setHeightAboveToolbar={setStickyAt}
              toggleLayout={toggleLayout}
            />
          )}
          renderScrollable={animatedScrollEvent => (
            <ObservationsFlashList
              dataCanBeFetched={!!currentUser}
              data={observations.filter( o => o.isValid() )}
              handlePullToRefresh={handlePullToRefresh}
              handleIndividualUploadPress={handleIndividualUploadPress}
              onScroll={animatedScrollEvent}
              hideLoadingWheel={!isFetchingNextPage || !currentUser}
              isFetchingNextPage={isFetchingNextPage}
              isConnected={isConnected}
              obsListKey="MyObservations"
              layout={layout}
              onEndReached={onEndReached}
              onLayout={onListLayout}
              ref={listRef}
              showObservationsEmptyScreen
              showNoResults={showNoResults}
              testID="MyObservationsAnimatedList"
              renderHeader={(
                <Announcements isConnected={isConnected} />
              )}
            />
          )}
        />
      </ViewWrapper>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
    </>
  );
};

export default MyObservations;
