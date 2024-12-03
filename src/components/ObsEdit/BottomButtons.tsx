import classnames from "classnames";
import {
  Button,
  ButtonBar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  buttonPressed: boolean,
  canSaveOnly: boolean,
  handlePress: Function,
  loading: boolean,
  showFocusedChangesButton: boolean,
  showFocusedUploadButton: boolean
  showHalfOpacity: boolean,
  wasSynced: boolean,
}

const BottomButtons = ( {
  buttonPressed,
  canSaveOnly,
  handlePress,
  loading,
  showFocusedChangesButton,
  showFocusedUploadButton,
  showHalfOpacity,
  wasSynced
}: Props ): Node => {
  const { t } = useTranslation( );

  const isSaving = buttonPressed === "save" && loading;
  const disabled = buttonPressed !== null;

  const saveButton = (
    <Button
      className="px-[25px]"
      onPress={( ) => handlePress( "save" )}
      testID="ObsEdit.saveButton"
      text={t( "SAVE" )}
      level="neutral"
      loading={isSaving}
      disabled={disabled}
    />
  );

  const saveChangesButton = (
    <Button
      onPress={( ) => handlePress( "save" )}
      testID="ObsEdit.saveChangesButton"
      text={t( "SAVE-CHANGES" )}
      level={showFocusedChangesButton
        ? "focus"
        : "neutral"}
      loading={isSaving}
      disabled={disabled}
    />
  );

  const uploadButton = (
    <Button
      className="ml-3 grow"
      level={showFocusedUploadButton
        ? "focus"
        : "neutral"}
      text={t( "UPLOAD-NOW" )}
      testID="ObsEdit.uploadButton"
      onPress={( ) => handlePress( "upload" )}
      loading={buttonPressed === "upload" && loading}
      disabled={disabled}
    />
  );

  const renderButtons = ( ) => {
    if ( canSaveOnly ) {
      return saveButton;
    }
    if ( wasSynced ) {
      return saveChangesButton;
    }
    return (
      <View className={classnames( "flex-row justify-evenly", {
        "opacity-50": showHalfOpacity
      } )}
      >
        {saveButton}
        {uploadButton}
      </View>
    );
  };

  return (
    <ButtonBar>
      {renderButtons( )}
    </ButtonBar>
  );
};

export default BottomButtons;
