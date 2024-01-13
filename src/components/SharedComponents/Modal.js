// @flow
import * as React from "react";
import RNModal from "react-native-modal";

// repurposed from Seek: https://github.com/inaturalist/SeekReactNative/blob/main/components/UIComponents/Modals/Modal.js

type Props = {
  showModal: boolean,
  closeModal: Function,
  modal: any,
  backdropOpacity?: number,
  fullScreen?: boolean,
  onModalHide?: Function,
  style?: Object,
  animationIn?: string,
  animationOut?: string,
  disableSwipeDirection?: boolean
}

const modalStyle = {
  flex: 1,
  justifyContent: "flex-end"
};

const fullScreenModalStyle = {
  ...modalStyle,
  margin: 0
};

// accessibility might not work on Android because of backdrop
// https://github.com/react-native-modal/react-native-modal/issues/525

const Modal = ( {
  animationIn,
  animationOut,
  backdropOpacity,
  closeModal,
  disableSwipeDirection,
  fullScreen = false,
  modal,
  onModalHide,
  showModal,
  style
}: Props ): React.Node => {
  const swipeDirection = disableSwipeDirection
    ? null
    : "down";
  return (
    <RNModal
      isVisible={showModal}
      onBackdropPress={closeModal}
      onSwipeComplete={closeModal}
      // Always close the modal when Android back button pressed
      onRequestClose={closeModal}
      swipeDirection={swipeDirection}
      useNativeDriverForBackdrop
      useNativeDriver
      style={{
        ...style,
        ...( fullScreen
          ? fullScreenModalStyle
          : modalStyle
        )
      }}
      backdropOpacity={backdropOpacity}
      onModalHide={onModalHide}
      animationIn={animationIn || "slideInUp"}
      animationOut={animationOut || "slideOutDown"}
      // the following two lines prevent flickering
      // while modal is closing
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating
    >
      {modal}
    </RNModal>
  );
};

export default Modal;
