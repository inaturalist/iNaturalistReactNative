// @flow

import {
  BottomSheet, EvidenceButton, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  disableAddingMoreEvidence: boolean,
  setShowAddEvidenceSheet: Function,
  hidden?: boolean,
  onImportPhoto: Function,
  onTakePhoto: Function,
  onRecordSound: Function,
}

const AddEvidenceSheet = ( {
  setShowAddEvidenceSheet,
  disableAddingMoreEvidence,
  hidden,
  onImportPhoto,
  onTakePhoto,
  onRecordSound
}: Props ): Node => {
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowAddEvidenceSheet( false ),
    [setShowAddEvidenceSheet]
  );

  const onImportPhotoCallback = async () => {
    handleClose( );
    onImportPhoto();
  };

  // navigation.navigate( "Camera", { addEvidence: true, camera: "Standard" } );
  const onTakePhotoCallback = async () => {
    handleClose( );
    onTakePhoto();
  };

  const onRecordSoundCallback = () => {
    handleClose( );
    onRecordSound();
  };

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={t( "ADD-EVIDENCE" )}
      snapPoints={[202]}
      hidden={hidden}
      onChange={position => {
        if ( position === -1 ) {
          handleClose( );
        }
      }}
    >
      <View className="items-center p-5">
        {disableAddingMoreEvidence && (
          <List2>
            {t( "You-can-add-up-to-20-media" )}
          </List2>
        )}
        <View className="flex-row w-full justify-around">
          <EvidenceButton
            icon="camera"
            handlePress={onTakePhotoCallback}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Camera" )}
            accessibilityHint={t( "Navigates-to-camera" )}
          />
          <EvidenceButton
            icon="gallery"
            handlePress={onImportPhotoCallback}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Bulk-importer" )}
            accessibilityHint={t( "Navigates-to-bulk-importer" )}
          />
          <EvidenceButton
            icon="microphone"
            handlePress={onRecordSoundCallback}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Sound-recorder" )}
            accessibilityHint={t( "Navigates-to-sound-recorder" )}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default AddEvidenceSheet;
