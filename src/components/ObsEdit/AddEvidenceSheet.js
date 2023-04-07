// @flow

import { useNavigation } from "@react-navigation/native";
import { EvidenceButton, List2 } from "components/SharedComponents";
import BottomSheet from "components/SharedComponents/BottomSheet";
import BottomSheetStandardBackdrop from "components/SharedComponents/BottomSheetStandardBackdrop";
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

  const renderBackdrop = props => <BottomSheetStandardBackdrop props={props} />;

  const onImportPhoto = async () => {
    navigation.navigate( "PhotoGallery", { skipGroupPhotos: true } );
    handleClose( );
  };

  const onTakePhoto = async () => {
    navigation.navigate( "StandardCamera", { addEvidence: true } );
    handleClose( );
  };

  const onRecordSound = () => {
    // TODO - need to implement
    handleClose( );
  };

  return (
    <BottomSheet
      backdropComponent={renderBackdrop}
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
