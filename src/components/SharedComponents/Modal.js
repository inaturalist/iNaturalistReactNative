// @flow
import * as React from "react";
import RNModal from "react-native-modal";

// repurposed from Seek: https://github.com/inaturalist/SeekReactNative/blob/main/components/UIComponents/Modals/Modal.js

type Props = {
  showModal: boolean,
  closeModal: Function,
  modal: any,
  backdropOpacity?: number,
  style?: Object,
  animationIn?: string,
  animationOut?: string,
  disableSwipeDirection?: boolean
}

const modalStyle = {
  flex: 1,
  justifyContent: "flex-end"
};

// accessibility might not work on Android because of backdrop
// https://github.com/react-native-modal/react-native-modal/issues/525

const Modal = ( {
  showModal, closeModal, modal, backdropOpacity, style,
  animationIn, animationOut, disableSwipeDirection = false
}: Props ): React.Node => {
  const swipeDirection = disableSwipeDirection
    ? null
    : "down";
  return (
    <RNModal
      isVisible={showModal}
      onBackdropPress={closeModal}
      onSwipeComplete={closeModal}
      swipeDirection={swipeDirection}
      useNativeDriverForBackdrop
      useNativeDriver
      style={{ ...style, ...modalStyle }}
      backdropOpacity={backdropOpacity}
      animationIn={animationIn || "slideInUp"}
      animationOut={animationOut || "slideOutDown"}
    >
      {modal}
    </RNModal>
  );
};

export default Modal;
