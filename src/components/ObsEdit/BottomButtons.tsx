import classnames from "classnames";
import {
  Button,
  ButtonBar
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -3,
  shadowOpacity: 0.2
} );

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

  const saveChangesButton = (
    <Button
      className="px-[25px]"
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

  const saveButton = {
    title: t( "SAVE" ),
    onPress: ( ) => handlePress( "save" ),
    isPrimary: false,
    testID: "ObsEdit.saveButton",
    disabled,
    level: "neutral",
    loading: isSaving,
    isPrimary: false,
    className: "px-[25px]"
  };

  const uploadButton = {
    title: t( "UPLOAD-NOW" ),
    onPress: ( ) => handlePress( "upload" ),
    isPrimary: true,
    testID: "ObsEdit.uploadButton",
    loading: buttonPressed === "upload" && loading,
    level: showFocusedUploadButton
      ? "focus"
      : "neutral",
    disabled,
    className: "ml-3 grow"
  };

  const buttonConfiguration = [saveButton, uploadButton];

  const renderButtons = ( ) => {
    if ( canSaveOnly ) {
      return (
        <ButtonBar buttonConfiguration={[saveButton]} />
      );
    }
    if ( wasSynced ) {
      return (
        <ButtonBar>
          {saveChangesButton}
        </ButtonBar>
      );
    }
    return (
      <ButtonBar buttonConfiguration={buttonConfiguration} containerClass="p-[15px]" />
    );
  };

  return (
    <View
      className={classnames( "bg-white", {
        "opacity-50": showHalfOpacity
      } )}
      style={DROP_SHADOW}
    >
      { renderButtons( ) }
    </View>
  );
};

export default BottomButtons;
