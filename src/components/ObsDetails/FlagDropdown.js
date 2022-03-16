// @flow

import React, { useState, useCallback } from "react";
import { Text, Pressable, View } from "react-native";
import type { Node } from "react";

import Modal from "../SharedComponents/Modal";

const FlagDropdown = ( ): Node => {
  const [showModal, setModal] = useState( false );

  const openModal = useCallback( ( ) => setModal( true ), [] );
  const closeModal = useCallback( ( ) => setModal( false ), [] );

  return (
    <>
      <Modal
        showModal={showModal}
        closeModal={closeModal}
        modal={<View />}
      />
      <Pressable onPress={openModal}>
        <Text>flag</Text>
      </Pressable>
    </>
  );
};

export default FlagDropdown;
