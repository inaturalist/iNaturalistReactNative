// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal";
import { Modal } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import { t } from "i18next";
import { getCurrentRoute } from "navigation/navigationUtils.ts";
import * as React from "react";
import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

const logger = log.extend( "AddObsButton" );

const AddObsButton = (): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const isAdvancedUser = useStore( state => state.isAdvancedUser );
  const navigation = useNavigation( );
  React.useEffect( ( ) => {
    logger.info( `isAdvancedUser: ${isAdvancedUser}` );
  }, [isAdvancedUser] );

  const navAndCloseModal = ( screen, params ) => {
    const currentRoute = getCurrentRoute();
    if ( screen !== "ObsEdit" ) {
      resetObservationFlowSlice( );
    }
    // access nested screen
    navigation.navigate( "NoBottomTabStackNavigator", {
      screen,
      params: { ...params, previousScreen: currentRoute }
    } );
    closeModal( );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AI" } ); };

  const addObsModal = <AddObsModal closeModal={closeModal} navAndCloseModal={navAndCloseModal} />;

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={addObsModal}
      />
      <GradientButton
        sizeClassName="w-[69px] h-[69px]"
        onPress={isAdvancedUser
          ? openModal
          : navToARCamera}
        accessibilityLabel={t( "Add-observations" )}
        accessibilityHint={isAdvancedUser
          ? t( "Shows-observation-creation-options" )
          : t( "Opens-the-AI-camera" )}
        iconName={isAdvancedUser && "plus"}
        iconSize={isAdvancedUser && 31}
      />
    </>
  );
};

export default AddObsButton;
