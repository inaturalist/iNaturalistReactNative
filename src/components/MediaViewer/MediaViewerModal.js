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
  onDeletePhoto?: Function,
  onDeleteSound?: Function,
  photos?: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  sounds?: Array<{
    id?: number,
    file_url: string,
    uuid: string
  }>,
  showModal: boolean,
  uri?: string | null
}

const MediaViewerModal = ( {
  editable,
  header,
  onClose = ( ) => { },
  onDeletePhoto,
  onDeleteSound,
  photos = [],
  showModal,
  sounds,
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
        onDeletePhoto={onDeletePhoto}
        onDeleteSound={onDeleteSound}
        photos={photos}
        sounds={sounds}
        uri={uri}
      />
    )}
  />
);

export default MediaViewerModal;
