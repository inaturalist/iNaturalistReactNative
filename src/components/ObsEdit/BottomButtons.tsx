import classnames from "classnames";
import {
  Button,
  ButtonBar,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -3,
  shadowOpacity: 0.2,
} );

export const UPLOAD = "upload";
export const SAVE = "save";

export type ButtonType = typeof SAVE | typeof UPLOAD | null;
export type ButtonTypeNonNull = typeof SAVE | typeof UPLOAD;

interface Props {
  buttonPressed: ButtonType;
  canSaveOnly: boolean;
  handlePress: ( type: ButtonTypeNonNull ) => void;
  loading: boolean;
  showFocusedChangesButton: boolean;
  showFocusedUploadButton: boolean;
  showHalfOpacity: boolean;
  wasSynced: boolean;
}

const BottomButtons = ( {
  buttonPressed,
  canSaveOnly,
  handlePress,
  loading,
  showFocusedChangesButton,
  showFocusedUploadButton,
  showHalfOpacity,
  wasSynced,
}: Props ) => {
  const { t } = useTranslation( );

  const isSaving = buttonPressed === SAVE && loading;
  const disabled = buttonPressed !== null;

  const saveChangesButton = (
    <Button
      className="px-[25px]"
      onPress={( ) => handlePress( SAVE )}
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
    onPress: ( ) => handlePress( SAVE ),
    isPrimary: false,
    testID: "ObsEdit.saveButton",
    disabled,
    level: "neutral",
    loading: isSaving,
    className: "px-[25px]",
  };

  const uploadButton = {
    title: t( "UPLOAD-NOW" ),
    onPress: ( ) => handlePress( UPLOAD ),
    isPrimary: true,
    testID: "ObsEdit.uploadButton",
    loading: buttonPressed === UPLOAD && loading,
    level: showFocusedUploadButton
      ? "focus"
      : "neutral",
    disabled,
    className: "ml-3 grow",
  };

  const buttonConfiguration = [saveButton, uploadButton];

  const renderButtons = ( ) => {
    if ( canSaveOnly ) {
      return (
        <ButtonBar
          buttonConfiguration={[{ ...saveButton, className: "grow" }]}
          containerClass="p-[15px]"
        />
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
        "opacity-50": showHalfOpacity,
      } )}
      style={DROP_SHADOW}
    >
      { renderButtons( ) }
    </View>
  );
};

export default BottomButtons;
