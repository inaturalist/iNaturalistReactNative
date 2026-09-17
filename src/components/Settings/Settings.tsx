import {
  Heading4,
  ScrollViewWrapper,
  SwitchRow,
} from "components/SharedComponents";
import React, { useCallback } from "react";
import {
  View,
} from "react-native";
import changeLanguage from "sharedHelpers/changeLanguage";
import {
  useCurrentUser,
  useLayoutPrefs,
  useTranslation,
} from "sharedHooks";

import AdvancedSettings from "./AdvancedSettings";
import LanguageSetting from "./LanguageSetting";
import LoggedInDefaultSettings from "./LoggedInDefaultSettings";

const Settings = ( ) => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser( );
  const {
    isDefaultMode,
    setIsDefaultMode,
  } = useLayoutPrefs( );

  const handleValueChange = useCallback( ( newValue: boolean ) => {
    setIsDefaultMode( !newValue );
  }, [setIsDefaultMode] );

  // maybe there's a less confusing way to do this,
  // but this worked for my brain on a deadline
  const isAdvancedMode = !isDefaultMode;

  return (
    <ScrollViewWrapper>
      <View className="p-4">
        <Heading4 className="mb-[15px]">{t( "ADVANCED-SETTINGS" )}</Heading4>
        <SwitchRow
          testID="advanced-interface-switch"
          classNames="ml-[6px]"
          smallLabel
          value={isAdvancedMode}
          onValueChange={handleValueChange}
          label={t( "Advanced-Mode" )}
        />
        {isAdvancedMode && <AdvancedSettings />}
        {currentUser
          ? <LoggedInDefaultSettings onLocaleChange={changeLanguage} />
          : (
            <View className="mt-[30px]">
              <LanguageSetting onChange={changeLanguage} />
            </View>
          )}
      </View>
    </ScrollViewWrapper>
  );
};

export default Settings;
