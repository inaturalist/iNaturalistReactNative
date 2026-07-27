import MediaViewer from "components/MediaViewer/MediaViewer";
import Modal from "components/SharedComponents/Modal";
import React from "react";

interface Props {
  autoPlaySound?: boolean; // automatically start playing a sound when it is visible
  editable?: boolean;
  deleting?: boolean;
  // Optional component to use as the header
  header?: Function;
  onClose?: Function;
  onDeletePhoto?: Function;
  onDeleteSound?: Function;
  photos?: {
    id?: number;
    url: string;
    localFilePath?: string;
    attribution?: string;
    licenseCode?: string;
  }[];
  sounds?: {
    file_url: string;
  }[];
  showModal: boolean;
  uri?: string | null;
}

const MediaViewerModal = ( {
  autoPlaySound,
  editable,
  deleting,
  header,
  onClose = ( ) => undefined,
  onDeletePhoto,
  onDeleteSound,
  photos = [],
  showModal,
  sounds,
  uri,
}: Props ) => (
  <Modal
    showModal={showModal}
    fullScreen
    closeModal={onClose}
    disableSwipeDirection
    modal={(
      <MediaViewer
        autoPlaySound={autoPlaySound}
        editable={editable}
        deleting={deleting}
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
