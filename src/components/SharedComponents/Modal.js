// @flow
import * as React from "react";
import RNModal from "react-native-modal";

// repurposed from Seek: https://github.com/inaturalist/SeekReactNative/blob/main/components/UIComponents/Modals/Modal.js

type Props = {
  showModal: boolean,
  closeModal: Function,
  modal: any,
  backdropOpacity?: number
}

const modalStyle = {
  flex: 1,
  justifyContent: "flex-end"
};

// accessibility might not work on Android because of backdrop
// https://github.com/react-native-modal/react-native-modal/issues/525

const Modal = ( {
  showModal, closeModal, modal, backdropOpacity
}: Props ): React.Node => (
  <RNModal
    isVisible={showModal}
    onBackdropPress={closeModal}
    onSwipeComplete={closeModal}
    swipeDirection="down"
    useNativeDriverForBackdrop
    useNativeDriver
    style={modalStyle}
    backdropOpacity={backdropOpacity}
  >
    {modal}
  </RNModal>
);

export default Modal;
