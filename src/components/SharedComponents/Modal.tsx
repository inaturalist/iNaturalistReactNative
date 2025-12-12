import * as React from "react";
import type { ViewStyle } from "react-native";
import RNModal from "react-native-modal";

// repurposed from Seek: https://github.com/inaturalist/SeekReactNative/blob/main/components/UIComponents/Modals/Modal.js

interface Props {
  showModal: boolean;
  closeModal: () => void;
  modal: React.ReactNode;
  backdropOpacity?: number;
  fullScreen?: boolean;
  onModalHide?: () => void;
  style?: ViewStyle;
  animationIn?: string;
  animationOut?: string;
  disableSwipeDirection?: boolean;
  noAnimation?: boolean;
}

const modalStyle = {
  flex: 1,
  justifyContent: "flex-end"
} as const;

const fullScreenModalStyle = {
  ...modalStyle,
  margin: 0
} as const;

// accessibility might not work on Android because of backdrop
// https://github.com/react-native-modal/react-native-modal/issues/525

const Modal = ( {
  animationIn,
  animationOut,
  backdropOpacity,
  closeModal,
  disableSwipeDirection,
  fullScreen = false,
  noAnimation = false,
  modal,
  onModalHide,
  showModal,
  style
}: Props ) => {
  const swipeDirection = disableSwipeDirection
    ? undefined
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
      animationInTiming={noAnimation
        ? 1
        : 300}
      animationOutTiming={noAnimation
        ? 1
        : 300}
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
