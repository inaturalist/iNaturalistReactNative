// @flow

import CameraOptionsModal from "components/CameraOptionsModal";
import Modal from "components/SharedComponents/Modal";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";

const CameraOptionsButton = ( ): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( ( ) => setModal( true ), [] );
  const closeModal = React.useCallback( ( ) => setModal( false ), [] );

  const showNewObservationOptions = ( ) => openModal( );

  const { t } = useTranslation( );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<CameraOptionsModal closeModal={closeModal} />}
      />
      <Pressable
        accessible
        testID="camera-options-button"
        onPress={showNewObservationOptions}
        accessibilityRole="button"
        accessibilityLabel={t( "Show-new-observation-options" )}
        accessibilityHint={t( "Show-new-observation-options-desc" )}
      >
        <IconMaterial name="add-circle" size={30} />
      </Pressable>
    </>
  );
};

export default CameraOptionsButton;
