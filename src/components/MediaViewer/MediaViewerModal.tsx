import MediaViewer from "components/MediaViewer/MediaViewer";
import Modal from "components/SharedComponents/Modal";
import React from "react";

interface PhotoItem {
  attribution?: string;
  licenseCode?: string;
  localFilePath?: string;
  url?: string;
}

interface SoundItem {
  file_url: string;
  hidden: boolean;
}

interface Props {
  autoPlaySound?: boolean; // automatically start playing a sound when it is visible
  editable?: boolean;
  deleting?: boolean;
  // Optional component to use as the header
  header?: (
    { onClose, photoCount }: { onClose: ( ) => void; photoCount: number}
  ) => React.JSX.Element;
  onClose?: ( ) => void;
  onDeletePhoto?: ( uri: string ) => void;
  onDeleteSound?: ( uri: string ) => void;
  photos?: PhotoItem[];
  sounds?: SoundItem[];
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
