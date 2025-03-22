import {
  Heading4,
  ScrollViewWrapper,
  SwitchRow
} from "components/SharedComponents";
import React, { useCallback } from "react";
import {
  StatusBar,
  View
} from "react-native";
// import { log } from "sharedHelpers/logger";
import {
  useCurrentUser,
  useLayoutPrefs,
  useTranslation
} from "sharedHooks";

import AdvancedSettings from "./AdvancedSettings";
import LoggedInDefaultSettings from "./LoggedInDefaultSettings";

// const logger = log.extend( "Settings" );

const Settings = ( ) => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser( );
  const {
    displayAdvancedSettings,
    setDisplayAdvancedSettings
  } = useLayoutPrefs( );

  const handleValueChange = useCallback( newValue => {
    setDisplayAdvancedSettings( newValue );
  }, [setDisplayAdvancedSettings] );

  return (
    <ScrollViewWrapper>
      <StatusBar barStyle="dark-content" />
      <View className="p-5">
        <Heading4 className="mb-[15px]">{t( "ADVANCED-SETTINGS" )}</Heading4>
        <SwitchRow
          testID="advanced-interface-switch"
          smallLabel
          value={displayAdvancedSettings}
          onValueChange={handleValueChange}
          label={t( "View-Advanced-Settings" )}
        />
        {displayAdvancedSettings && <AdvancedSettings />}
        {currentUser && <LoggedInDefaultSettings />}
      </View>
    </ScrollViewWrapper>
  );
};

export default Settings;
