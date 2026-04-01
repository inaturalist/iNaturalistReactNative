// @flow

import { useNavigation } from "@react-navigation/native";
import {
  BottomSheet, EvidenceButton, List2,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  disableAddingMoreEvidence: boolean,
  hidden?: boolean,
  onClose: Function
}

const AddEvidenceSheet = ({
  disableAddingMoreEvidence,
  hidden,
  onClose,
}: Props): Node => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <BottomSheet
      onPressClose={onClose}
      headerText={t("ADD-EVIDENCE")}
      hidden={hidden}
    >
      <View testID="AddEvidenceSheet" className="items-center p-5">
        {disableAddingMoreEvidence && (
          <List2 className="mb-5">
            {t("You-can-add-up-to-20-media")}
          </List2>
        )}
        <View className="flex-row w-full justify-around">
          <EvidenceButton
            icon="camera"
            handlePress={() => {
              navigation.navigate("NoBottomTabStackNavigator", {
                screen: "Camera",
                params: {
                  addEvidence: true,
                  camera: "Standard",
                },
              });
            }}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t("Camera")}
            accessibilityHint={t("Navigates-to-camera")}
          />
          <EvidenceButton
            icon="photo-library"
            handlePress={() => {
              // Show photo library, but skip group photos phase
              navigation.navigate("NoBottomTabStackNavigator", {
                screen: "PhotoLibrary",
                params: { skipGroupPhotos: true },
              });
            }}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t("Bulk-importer")}
            accessibilityHint={t("Navigates-to-bulk-importer")}
          />
          <EvidenceButton
            icon="microphone"
            handlePress={() => {
              navigation.navigate(
                "NoBottomTabStackNavigator",
                { screen: "SoundRecorder", params: { addEvidence: true } },
              );
            }}
            disabled={disableAddingMoreEvidence}
            accessibilityLabel={t("Sound-recorder")}
            accessibilityHint={t("Navigates-to-sound-recorder")}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default AddEvidenceSheet;
