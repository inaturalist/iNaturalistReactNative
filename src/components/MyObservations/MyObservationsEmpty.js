// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal";
import {
  Body1,
  Body2,
  Button,
  Heading2
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import Modal from "components/SharedComponents/Modal";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
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

  const resetStore = useStore( state => state.resetStore );
  const navAndCloseModal = ( screen, params ) => {
    if ( screen !== "ObsEdit" ) {
      resetStore( );
    }
    navigation.navigate( "CameraNavigator", {
      screen,
      params
    } );
    setShowModal( false );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AR" } ); };

  if ( isFetchingNextPage ) {
    return null;
  }
  if ( !currentUser ) {
    return (
      <View className="mx-5 items-center">
        <GradientButton
          onPress={navToARCamera}
          accessibilityHint={t( "Opens-add-observation-modal" )}
          iconName="plus"
          iconSize={31}
        />
        <Heading2 className="mt-5 mb-3">
          {t( "Identify-an-organism-with-the-iNaturalist-AI-Camera" )}
        </Heading2>
      </View>
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
          onPress={( ) => setShowModal( true )}
          accessibilityLabel={t( "Observe" )}
          accessibilityHint={t( "Opens-add-observation-modal" )}
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
