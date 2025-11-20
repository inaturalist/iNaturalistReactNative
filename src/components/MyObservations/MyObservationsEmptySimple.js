// @flow
import { useNavigation } from "@react-navigation/native";
import { AccountCreationCard } from "components/OnboardingModal/PivotCards";
import {
  HeaderUser,
  Heading2,
  ViewWrapper
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import {
  Pressable, View
} from "components/styledComponents";
import Arrow from "images/svg/curved_arrow_down.svg";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import LoginBanner from "./LoginBanner";

interface Props {
  currentUser: Object | null;
  isConnected: boolean;
  justFinishedSignup: boolean;
}

const MyObservationsEmptySimple = ( { currentUser, isConnected, justFinishedSignup }:
  Props ): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );

  const navAndCloseModal = ( screen, params ) => {
    if ( screen !== "ObsEdit" ) {
      resetObservationFlowSlice( );
    }
    navigation.navigate( "NoBottomTabStackNavigator", {
      screen,
      params
    } );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AI" } ); };

  return (
    <>
      <ViewWrapper>
        {!!currentUser && (
          <View className="flex-start ml-[18px] mt-[26px]">
            <HeaderUser user={currentUser} isConnected={isConnected} />
          </View>
        )}
        <LoginBanner
          currentUser={currentUser}
        />
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
      </ViewWrapper>

      <AccountCreationCard
        triggerCondition={
          justFinishedSignup && !!currentUser
        }
      />
    </>
  );
};

export default MyObservationsEmptySimple;
