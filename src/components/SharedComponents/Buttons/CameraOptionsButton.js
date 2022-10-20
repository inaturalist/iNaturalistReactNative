// @flow

import CameraOptionsModal from "components/Camera/CameraOptionsModal";
import Modal from "components/SharedComponents/Modal";
import * as React from "react";
import { Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

const CameraOptionsButton = ( ): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( ( ) => setModal( true ), [] );
  const closeModal = React.useCallback( ( ) => setModal( false ), [] );

  const navToCameraOptions = ( ) => openModal( );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<CameraOptionsModal closeModal={closeModal} />}
      />
      <Pressable onPress={navToCameraOptions} accessibilityRole="link">
        <IconMaterial name="add-circle" size={30} />
      </Pressable>
    </>
  );
};

export default CameraOptionsButton;
