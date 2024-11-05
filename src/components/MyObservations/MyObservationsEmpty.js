// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal.tsx";
import {
  Body1,
  Body2,
  Button,
  Heading2
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import FlashListEmptyWrapper from "components/SharedComponents/FlashList/FlashListEmptyWrapper.tsx";
import Modal from "components/SharedComponents/Modal.tsx";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  isFetchingNextPage: ?boolean
}

const MyObservationsEmpty = ( { isFetchingNextPage }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
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

  if ( isFetchingNextPage ) {
    return null;
  }
  if ( !currentUser ) {
    return (
      <FlashListEmptyWrapper
        headerHeight={177}
        emptyItemHeight={216}
      >
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
      </FlashListEmptyWrapper>
    );
  }
  return (
    <>
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
      <View className="mx-5">
        <Body1 className="mb-3 mt-5">
          {t( "Welcome-to-iNaturalist" )}
        </Body1>
        <Body2 className="mb-5">
          {t( "iNaturalist-is-a-community-of-naturalists" )}
        </Body2>
        <Body2 className="mb-5">
          {t( "Observations-created-on-iNaturalist" )}
        </Body2>
        <Button
          testID="MyObservationsEmpty.firstObservationButton"
          className="mb-2"
          text={t( "CREATE-YOUR-FIRST-OBSERVATION" )}
          level="focus"
          onPress={navToARCamera}
          accessibilityLabel={t( "Observe" )}
          accessibilityHint={t( "Opens-AI-camera" )}
        />
        <Body2 className="my-5">
          {t( "You-can-also-explore-existing-observations" )}
        </Body2>
        <Button
          className="mb-2"
          text={t( "EXPLORE-OBSERVATIONS" )}
          level="focus"
          onPress={( ) => navigation.navigate( "RootExplore" )}
          accessibilityLabel={t( "See-observations-in-explore" )}
          accessibilityHint={t( "Navigates-to-explore" )}
        />
      </View>
    </>
  );
};

export default MyObservationsEmpty;
