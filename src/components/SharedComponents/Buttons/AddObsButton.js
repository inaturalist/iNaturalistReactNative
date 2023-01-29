// @flow

import AddObsModal from "components/AddObsModal";
import Modal from "components/SharedComponents/Modal";
import * as React from "react";
import { Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

const AddObsButton = ( ): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( ( ) => setModal( true ), [] );
  const closeModal = React.useCallback( ( ) => setModal( false ), [] );

  const navToAddObs = ( ) => openModal( );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<AddObsModal closeModal={closeModal} />}
      />
      <Pressable
        testID="camera-options-button"
        onPress={navToAddObs}
        accessibilityRole="link"
      >
        <IconMaterial
          className="shadow-lg"
          name="add-circle"
          size={60}
          color={colors.primary}
        />
      </Pressable>
    </>
  );
};

export default AddObsButton;
