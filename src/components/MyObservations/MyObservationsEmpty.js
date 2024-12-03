// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import {
  Body1,
  Body2,
  Button
} from "components/SharedComponents";
import Modal from "components/SharedComponents/Modal.tsx";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

type Props = {
  isFetchingNextPage: ?boolean
}

const MyObservationsEmpty = ( { isFetchingNextPage }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
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
      <View className="mx-5 flex grow justify-center mb-[100px]">
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
