import {
  Body2,
  RadioButtonRow
} from "components/SharedComponents";
import React from "react";
import {
  View
} from "react-native";
// import { log } from "sharedHelpers/logger";
import {
  useLayoutPrefs,
  useTranslation
} from "sharedHooks";

// const logger = log.extend( "Settings" );

const AdvancedSettings = ( ) => {
  const { t } = useTranslation();
  const {
    isDefaultMode,
    isAllAddObsOptionsMode,
    setIsAllAddObsOptionsMode,
    isAdvancedSuggestionsMode,
    setIsSuggestionsFlowMode
  } = useLayoutPrefs();

  const renderSettingDescription = description => (
    <Body2 className="mt-3">{description}</Body2>
  );

  return (
    <>
      {!isDefaultMode && (
        <View className="mt-[20px]">
          {renderSettingDescription( t( "When-tapping-the-green-observation-button" ) )}
          <RadioButtonRow
            classNames="mt-[16.5px]"
            testID="all-observation-options"
            smallLabel
            checked={isAllAddObsOptionsMode}
            onPress={() => setIsAllAddObsOptionsMode( true )}
            label={t( "All-observation-options--list" )}
          />
          <RadioButtonRow
            classNames="mt-[16.5px]"
            smallLabel
            checked={!isAllAddObsOptionsMode}
            onPress={() => setIsAllAddObsOptionsMode( false )}
            label={t( "iNaturalist-AI-Camera" )}
          />
        </View>
      )}
      <View className="mt-[20px]">
        {renderSettingDescription( t( "After-capturing-or-importing-photos-show" ) )}
        <RadioButtonRow
          classNames="mt-[16.5px]"
          testID="suggestions-flow-mode"
          smallLabel
          checked={isAdvancedSuggestionsMode}
          onPress={() => setIsSuggestionsFlowMode( true )}
          label={t( "ID-Suggestions" )}
        />
        <RadioButtonRow
          classNames="mt-[16.5px]"
          smallLabel
          checked={!isAdvancedSuggestionsMode}
          onPress={() => setIsSuggestionsFlowMode( false )}
          label={t( "Edit-Observation" )}
        />
        <RadioButtonRow
          classNames="mt-[16.5px]"
          smallLabel
          // checked={!isAdvancedSuggestionsMode}
          // onPress={() => setIsSuggestionsFlowMode( false )}
          label={t( "Match-Screen" )}
        />
      </View>
      <View className="mt-[20px]">
        {renderSettingDescription( t( "When-viewing-observations-display" ) )}
        <RadioButtonRow
          classNames="mt-[16.5px]"
          smallLabel
          // checked={!isAdvancedSuggestionsMode}
          // onPress={() => setIsSuggestionsFlowMode( false )}
          label={t( "Activity-Details-View" )}
        />
        <RadioButtonRow
          classNames="mt-[16.5px]"
          smallLabel
          // checked={!isAdvancedSuggestionsMode}
          // onPress={() => setIsSuggestionsFlowMode( false )}
          label={t( "Simple-View" )}
        />
      </View>
    </>
  );
};

export default AdvancedSettings;
