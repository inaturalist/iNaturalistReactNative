// @flow

import MediaViewer from "components/MediaViewer/MediaViewer";
import Modal from "components/SharedComponents/Modal";
import type { Node } from "react";
import React from "react";

type Props = {
  editable?: boolean,
  // Optional component to use as the header
  header?: Function,
  onClose?: Function,
  onDelete?: Function,
  photos?: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  showModal: boolean,
  uri?: string
}

const MediaViewerModal = ( {
  editable,
  header,
  onClose = ( ) => { },
  onDelete,
  photos = [],
  showModal,
  uri
}: Props ): Node => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={onClose}
    disableSwipeDirection
    modal={(
      <MediaViewer
        editable={editable}
        header={header}
        onClose={onClose}
        onDelete={onDelete}
        photos={photos}
        uri={uri}
      />
    )}
  />
);

export default MediaViewerModal;
