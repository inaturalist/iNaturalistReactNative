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
import {
  useCurrentUser,
  useLayoutPrefs,
  useTranslation
} from "sharedHooks";

import AdvancedSettings from "./AdvancedSettings";
import LoggedInDefaultSettings from "./LoggedInDefaultSettings";

const Settings = ( ) => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser( );
  const {
    isDefaultMode,
    setIsDefaultMode
  } = useLayoutPrefs( );

  const handleValueChange = useCallback( newValue => {
    setIsDefaultMode( !newValue );
  }, [setIsDefaultMode] );

  // maybe there's a less confusing way to do this,
  // but this worked for my brain on a deadline
  const isAdvancedMode = !isDefaultMode;

  return (
    <ScrollViewWrapper>
      <StatusBar barStyle="dark-content" />
      <View className="p-4">
        <Heading4 className="mb-[15px]">{t( "ADVANCED-SETTINGS" )}</Heading4>
        <SwitchRow
          testID="advanced-interface-switch"
          classNames="ml-[6px]"
          smallLabel
          value={isAdvancedMode}
          onValueChange={handleValueChange}
          label={t( "Advanced-Settings" )}
        />
        {isAdvancedMode && <AdvancedSettings />}
        {currentUser && <LoggedInDefaultSettings />}
      </View>
    </ScrollViewWrapper>
  );
};

export default Settings;
