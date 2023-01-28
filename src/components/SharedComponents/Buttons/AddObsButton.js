// @flow

import AddObsModal from "components/AddObsModal";
import Modal from "components/SharedComponents/Modal";
import { t } from "i18next";
import * as React from "react";
<<<<<<< HEAD
import { IconButton, useTheme } from "react-native-paper";

const AddObsButton = ( ): React.Node => {
  const theme = useTheme( );
=======
import { Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

const AddObsButton = (): React.Node => {
>>>>>>> 6a61e5e (Incremental changes to navbar component)
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

<<<<<<< HEAD
=======
  const navToAddObs = () => openModal();

>>>>>>> 6a61e5e (Incremental changes to navbar component)
  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<AddObsModal closeModal={closeModal} />}
      />
<<<<<<< HEAD
      <IconButton
        icon="plus-sign"
        onPress={( ) => openModal( )}
        size={40}
        mode="contained"
        containerColor={theme.colors.secondary}
        iconColor={theme.colors.onSecondary}
        accessibilityLabel={t( "Open-add-evidence-modal" )}
        className="m-0"
        disabled={false}
        testID="add-obs-button"
      />
=======
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
>>>>>>> 6a61e5e (Incremental changes to navbar component)
    </>
  );
};

export default AddObsButton;
