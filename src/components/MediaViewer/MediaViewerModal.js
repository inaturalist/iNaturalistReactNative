// @flow

import MediaViewer from "components/MediaViewer/MediaViewer";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

type Props = {
  editable?: boolean,
  onClose?: Function,
  onDelete?: Function,
  showModal: boolean,
  uri?: string,
  uris?: Array<string>
}

const MediaViewerModal = ( {
  editable,
  onClose = ( ) => { },
  onDelete,
  showModal,
  uri,
  uris = []
}: Props ): Node => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={onClose}
    modal={(
      <MediaViewer
        editable={editable}
        onClose={onClose}
        onDelete={onDelete}
        uri={uri}
        uris={uris}
      />
    )}
  />
);

export default MediaViewerModal;
