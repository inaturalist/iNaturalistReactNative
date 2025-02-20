// @flow
import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import OnboardingCarouselModal from "components/Onboarding/OnboardingCarouselModal";
import {
  HeaderUser,
  Heading2,
  ViewWrapper
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import Modal from "components/SharedComponents/Modal.tsx";
import { View } from "components/styledComponents";
import Arrow from "images/svg/curved_arrow_down.svg";
import type { Node } from "react";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboardingShown } from "sharedHelpers/installData.ts";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

interface Props {
  currentUser: any;
  isConnected: boolean;
}

const MyObservationsEmptySimple = ( { currentUser, isConnected }: Props ): Node => {
  const { top } = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [onboardingShown, setOnboardingShown] = useOnboardingShown();
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

  return (
    <ViewWrapper>
      <OnboardingCarouselModal
        showModal={!onboardingShown}
        closeModal={() => setOnboardingShown( true )}
      />
      {!!currentUser && (
        <View className={`absolute px-6 py-4 mt-[${top}px]`}>
          <HeaderUser user={currentUser} isConnected={isConnected} />
        </View>
      )}
      <View className="flex grow flex-col justify-center mx-[67px]">
        <Pressable accessibilityRole="button" onPress={navToARCamera}>
          <Heading2
            testID="use-iNaturalist-intro-text"
            className="mb-8 text-center"
          >
            {t( "Use-iNaturalist-to-identify-any-living-thing" )}
          </Heading2>
        </Pressable>
        <View className="relative w-[141px] self-center">
          {/* $FlowIgnore[not-a-component] */}
          <Arrow className="absolute right-[-20px] top-[-23px]" />
          <GradientButton
            clas
            accessibilityLabel={t( "Add-observations" )}
            sizeClassName="w-[141px] h-[141px] self-center"
            onPress={navToARCamera}
            iconSize={76}
          />
        </View>
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
};

export default MyObservationsEmptySimple;
