// @flow

import * as React from "react";
import { Pressable, Text, View } from "react-native";

import CameraOptionsModal from "../../Camera/CameraOptionsModal";
import Modal from "../Modal";
import { viewStyles } from "../../../styles/obsEdit/obsEdit";

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
            <Text>camera</Text>
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
