// @flow

import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import AddObsModal from "components/AddObsModal.tsx";
import {
  Body1,
  Body2,
  Button,
  Heading2
} from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import Modal from "components/SharedComponents/Modal.tsx";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const HEADER_HEIGHT = 177;
const FOOTER_HEIGHT = 77;
const HALF_GRADIENT_AND_TEXT_HEIGHT = 216 / 2;

type Props = {
  isFetchingNextPage: ?boolean
}

const MyObservationsEmpty = ( { isFetchingNextPage }: Props ): Node => {
  const insets = useSafeAreaInsets( );
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const [showModal, setShowModal] = useState( false );

  const { height } = useWindowDimensions( );

  const outerViewHeight = (
    height + insets.top - HEADER_HEIGHT - FOOTER_HEIGHT - HALF_GRADIENT_AND_TEXT_HEIGHT
  ) * 0.5;

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
      // It seems to be a known issue that the EmptyListComponent of FlashList,
      // which is the parent here, is not possible to be used with a flex of 1, or flex grow.
      // The following workaround is to roughly center the content.
      // https://github.com/Shopify/flash-list/discussions/517
      <View
        className="px-[67px] items-center"
        style={{ height: outerViewHeight }}
      >
        <View className={classnames(
          "items-center absolute top-[50%]"
        )}
        >
          <GradientButton
            accessibilityLabel={t( "Add-observations" )}
            sizeClassName="w-[141px] h-[141px]"
            onPress={navToARCamera}
            iconSize={76}
          />
          <Pressable accessibilityRole="button" onPress={navToARCamera}>
            <Heading2 className="mt-6 text-center">
              {t( "Identify-an-organism-with-the-iNaturalist-AI-Camera" )}
            </Heading2>
          </Pressable>
        </View>
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
          onPress={navToARCamera}
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
