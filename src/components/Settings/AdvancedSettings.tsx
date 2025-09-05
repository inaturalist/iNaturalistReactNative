import {
  Body2,
  RadioButtonRow
} from "components/SharedComponents";
import React from "react";
import {
  View
} from "react-native";
import {
  useLayoutPrefs,
  useTranslation
} from "sharedHooks";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";

const AdvancedSettings = ( ) => {
  const { t } = useTranslation();
  const {
    isAllAddObsOptionsMode,
    setIsAllAddObsOptionsMode,
    screenAfterPhotoEvidence,
    setScreenAfterPhotoEvidence
  } = useLayoutPrefs();

  const renderSettingDescription = description => (
    <Body2>{description}</Body2>
  );

  return (
    <>
      <View className="mt-[20px]">
        {renderSettingDescription( t( "When-tapping-the-green-observation-button" ) )}
        <RadioButtonRow
          classNames="ml-[6px] mt-[15px]"
          testID="all-observation-options"
          smallLabel
          checked={isAllAddObsOptionsMode}
          onPress={() => setIsAllAddObsOptionsMode( true )}
          label={t( "All-observation-options--list" )}
        />
        <RadioButtonRow
          classNames="ml-[6px] mt-[15px]"
          smallLabel
          checked={!isAllAddObsOptionsMode}
          onPress={() => setIsAllAddObsOptionsMode( false )}
          label={t( "iNaturalist-AI-Camera" )}
        />
      </View>
      <View className="mt-[20px]">
        {renderSettingDescription( t( "After-capturing-or-importing-photos-show" ) )}
        <RadioButtonRow
          classNames="ml-[6px] mt-[15px]"
          testID="suggestions-flow-mode"
          smallLabel
          checked={screenAfterPhotoEvidence === SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS}
          onPress={() => setScreenAfterPhotoEvidence( SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS )}
          label={t( "ID-Suggestions" )}
        />
        <RadioButtonRow
          classNames="ml-[6px] mt-[15px]"
          smallLabel
          checked={screenAfterPhotoEvidence === SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT}
          onPress={() => setScreenAfterPhotoEvidence( SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT )}
          label={t( "Edit-Observation" )}
        />
        <RadioButtonRow
          classNames="ml-[6px] mt-[15px]"
          smallLabel
          checked={screenAfterPhotoEvidence === SCREEN_AFTER_PHOTO_EVIDENCE.MATCH}
          onPress={() => setScreenAfterPhotoEvidence( SCREEN_AFTER_PHOTO_EVIDENCE.MATCH )}
          label={t( "Match-Screen" )}
        />
      </View>
    </>
  );
};

export default AdvancedSettings;
