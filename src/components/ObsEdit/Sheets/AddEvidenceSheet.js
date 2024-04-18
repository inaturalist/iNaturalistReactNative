// @flow

import { useNavigation } from "@react-navigation/native";
import {
  BottomSheet, EvidenceButton, List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
disableAddingMoreEvidence: boolean,
    hidden?: boolean,
onClose: ( ) => void
}

const AddEvidenceSheet = ( {
  disableAddingMoreEvidence,
  hidden,
  onClose
}: Props ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const [choice, setChoice] = useState( null );

  return (
    <BottomSheet
      handleClose={onClose}
      headerText={t( "ADD-EVIDENCE" )}
      hidden={hidden}
      onChange={position => {
        // -1 means the sheet is fully hidden... and in theory it's safe to navigate away
        if ( position > -1 ) return;

        if ( choice === "camera" ) {
          navigation.navigate( "NoBottomTabStackNavigator", {
            screen: "Camera",
            params: {
              addEvidence: true,
              camera: "Standard"
            }
          } );
        } else if ( choice === "import" ) {
          // Show photo gallery, but skip group photos phase
          navigation.navigate( "NoBottomTabStackNavigator", {
            screen: "PhotoGallery",
            params: { skipGroupPhotos: true }
          } );
        } else if ( choice === "sound" ) {
          navigation.navigate(
            "NoBottomTabStackNavigator",
            { screen: "SoundRecorder", params: { addEvidence: true } }
          );
        }
      }}
    >
      <View className="items-center p-5">
        {disableAddingMoreEvidence && (
          <List2 className="mb-5">
            {t( "You-can-add-up-to-20-media" )}
          </List2>
        )}
        <View className="flex-row w-full justify-around">
          <EvidenceButton
            icon="camera"
            handlePress={( ) => {
              setChoice( "camera" );
              onClose( );
            }}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Camera" )}
            accessibilityHint={t( "Navigates-to-camera" )}
          />
          <EvidenceButton
            icon="gallery"
            handlePress={( ) => {
              setChoice( "import" );
              onClose( );
            }}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t( "Bulk-importer" )}
            accessibilityHint={t( "Navigates-to-bulk-importer" )}
          />
          <EvidenceButton
            icon="microphone"
            handlePress={( ) => {
              setChoice( "sound" );
              onClose( );
            }}
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
