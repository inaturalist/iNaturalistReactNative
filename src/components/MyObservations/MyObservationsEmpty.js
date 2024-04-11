// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal";
import {
  Body1, Body2, Button
} from "components/SharedComponents";
import Modal from "components/SharedComponents/Modal";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  isFetchingNextPage: ?boolean
}

const MyObservationsEmpty = ( { isFetchingNextPage }: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [showModal, setShowModal] = useState( false );

  const navAndCloseModal = async ( screen, params ) => {
    // TODO: implement this stub
    console.log( "screen", screen );
    console.log( "params", params );
    // navigation.navigate( "CameraNavigator", {
    //   screen,
    //   params: { ...params, previousScreen: null }
    // } );
    setShowModal( false );
  };

  if ( !isFetchingNextPage ) {
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
  }
  return null;
};

export default MyObservationsEmpty;
