// @flow
import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import {
  DismissableBanner,
  HeaderUser,
  Heading2,
  ViewWrapper
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import Modal from "components/SharedComponents/Modal.tsx";
import {
  Pressable, View
} from "components/styledComponents";
import Arrow from "images/svg/curved_arrow_down.svg";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

interface Props {
  currentUser: Object | null;
  isConnected: boolean;
}

const MyObservationsEmptySimple = ( { currentUser, isConnected }: Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState( false );
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const [showedExistingAccountBanner, setShowedExistingAccountBanner] = useState( false );
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
      {!!currentUser && (
        <View className="flex-start ml-[18px] mt-[26px]">
          <HeaderUser user={currentUser} isConnected={isConnected} />
        </View>
      )}
      {
        !showedExistingAccountBanner
        && (
          // extra view to get absolutely positioned view to follow safeareaview rules
          <View>
            <View
              className="absolute top-0 left-0 right-0 mx-[22px] w-auto z-20"
              pointerEvents="box-none"
            >
              <DismissableBanner
                icon="inaturalist"
                iconColor={colors.inatGreen}
                currentUser={currentUser}
                text={t( "Already-have-an-iNaturalist-account" )}
                onPress={() => navigation.navigate( "LoginStackNavigator" )}
                dismiss={() => setShowedExistingAccountBanner( true )}
              />
            </View>
          </View>
        )
      }
      <View className="grow justify-center mx-[67px]">
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
            iconSize={96}
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
