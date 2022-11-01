// @flow

import type { Node } from "react";
import React from "react";
import { Modal, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

type Props = {
  children: any,
  mediaViewerVisible: boolean,
  hideModal: Function
}

const MediaViewerModal = ( { children, mediaViewerVisible, hideModal }: Props ): Node => {
  const insets = useSafeAreaInsets( );
  return (
    <Portal>
      <Modal
        visible={mediaViewerVisible}
        onDismiss={hideModal}
        style={{
          backgroundColor: colors.black,
          marginTop: -insets.top,
          paddingTop: insets.top,
          marginBottom: -insets.bottom,
          paddingBottom: insets.bottom
        }}
      >
        {children}
      </Modal>
    </Portal>
  );
};

export default MediaViewerModal;
