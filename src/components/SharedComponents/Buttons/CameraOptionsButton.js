// @flow

import * as React from "react";
import { Pressable, View } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

import { viewStyles } from "../../../styles/obsEdit/obsEdit";
import CameraOptionsModal from "../../Camera/CameraOptionsModal";
import Modal from "../Modal";

type Props = {
  buttonType?: string
}

const CameraOptionsButton = ( { buttonType }: Props ): React.Node => {
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
      {buttonType === "footer"
        ? (
          <Pressable onPress={navToCameraOptions} accessibilityRole="link">
            <IconMaterial name="add-circle" size={35} />
          </Pressable>
        ) : (
          <Pressable onPress={navToCameraOptions}>
            <View style={viewStyles.evidenceButton} />
          </Pressable>
        )}
    </>
  );
};

export default CameraOptionsButton;
