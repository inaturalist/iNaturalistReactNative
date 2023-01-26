// @flow

import AddObsModal from "components/AddObsModal";
import Modal from "components/SharedComponents/Modal";
import { t } from "i18next";
import * as React from "react";
import { IconButton, useTheme } from "react-native-paper";

const AddObsButton = ( ): React.Node => {
  const theme = useTheme( );
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( ( ) => setModal( true ), [] );
  const closeModal = React.useCallback( ( ) => setModal( false ), [] );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<AddObsModal closeModal={closeModal} />}
      />
      <IconButton
        icon="icon-createobservation"
        onPress={( ) => openModal( )}
        size={40}
        mode="contained"
        containerColor={theme.colors.secondary}
        iconColor={theme.colors.onSecondary}
        accessibilityLabel={t( "Open-add-evidence-modal" )}
        className="m-0"
      />
    </>
  );
};

export default AddObsButton;
