// @flow

import { useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal";
import { Modal } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import { t } from "i18next";
import { getCurrentRoute } from "navigation/navigationUtils";
import * as React from "react";
import useStore from "stores/useStore";

const AddObsButton = (): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  const resetStore = useStore( state => state.resetStore );
  const isAdvancedUser = useStore( state => state.isAdvancedUser );
  const navigation = useNavigation( );
  const navAndCloseModal = ( screen, params ) => {
    const currentRoute = getCurrentRoute();
    if ( screen !== "ObsEdit" ) {
      resetStore( );
    }
    // access nested screen
    navigation.navigate( "CameraNavigator", {
      screen,
      params: { ...params, previousScreen: currentRoute }
    } );
    closeModal( );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AR" } ); };

  const addObsModal = <AddObsModal closeModal={closeModal} navAndCloseModal={navAndCloseModal} />;

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={addObsModal}
      />
      <GradientButton
        onPress={isAdvancedUser
          ? openModal
          : navToARCamera}
        accessibilityHint={isAdvancedUser && t( "Opens-add-observation-modal" )}
        iconName={isAdvancedUser && "plus"}
        iconSize={isAdvancedUser && 31}
      />
    </>
  );
};

export default AddObsButton;
