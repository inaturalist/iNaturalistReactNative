import MediaViewer from "components/MediaViewer/MediaViewer";
import Modal from "components/SharedComponents/Modal";
import React, { useState } from "react";

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
  onEditPhoto?: ( uri: string, newLocalFilePath: string ) => void;
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
  onEditPhoto,
  photos = [],
  showModal,
  sounds,
  uri,
}: Props ) => {
  const [cropping, setCropping] = useState( false );

  return (
    <Modal
      showModal={showModal}
      fullScreen
      closeModal={onClose}
      // Android's back gesture starts at the screen edges, where the crop
      // frame's corners usually are, so dragging a corner would close the viewer
      closeOnBackPress={!cropping}
      disableSwipeDirection
      modal={(
        <MediaViewer
          autoPlaySound={autoPlaySound}
          editable={editable}
          deleting={deleting}
          header={header}
          onClose={onClose}
          onCroppingChange={setCropping}
          onDeletePhoto={onDeletePhoto}
          onDeleteSound={onDeleteSound}
          onEditPhoto={onEditPhoto}
          photos={photos}
          sounds={sounds}
          uri={uri}
        />
      )}
    />
  );
};

export default MediaViewerModal;
