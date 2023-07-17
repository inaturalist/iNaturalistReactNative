// @flow

import { useNavigation } from "@react-navigation/native";
import {
  BottomSheet, EvidenceButton, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  disableAddingMoreEvidence: boolean,
  setShowAddEvidenceSheet: Function
}

const AddEvidenceSheet = ( {
  setShowAddEvidenceSheet,
  disableAddingMoreEvidence
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowAddEvidenceSheet( false ),
    [setShowAddEvidenceSheet]
  );

  const onImportPhoto = async () => {
    navigation.navigate( "PhotoGallery", { skipGroupPhotos: true } );
    handleClose( );
  };

  const onTakePhoto = async () => {
    navigation.navigate( "Camera", { addEvidence: true, camera: "Standard" } );
    handleClose( );
  };

  const onRecordSound = () => {
    // TODO - need to implement
    handleClose( );
  };

  return (
    <BottomSheet
      handleClose={handleClose}
      headerText={t( "ADD-EVIDENCE" )}
      snapPoints={[202]}
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
            handlePress={onTakePhoto}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Camera" )}
            accessibilityHint={t( "Navigates-to-camera" )}
          />
          <EvidenceButton
            icon="gallery"
            handlePress={onImportPhoto}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Bulk-importer" )}
            accessibilityHint={t( "Navigates-to-bulk-importer" )}
          />
          <EvidenceButton
            icon="microphone"
            handlePress={onRecordSound}
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
