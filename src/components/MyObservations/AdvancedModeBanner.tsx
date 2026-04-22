import {
  Body3,
  UnderlinedLink,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useLayoutPrefs, useTranslation } from "sharedHooks";

import BannerDismissButton from "./BannerDismissButton";

const AdvancedModeBanner = ( ) => {
  const { t } = useTranslation( );
  const {
    setIsDefaultMode,
  } = useLayoutPrefs();

  return (
    <View className="px-[27px] py-[20px]">
      <BannerDismissButton
        accessibilityLabel={t( "Close" )}
        onPress={() => console.log( "Dismiss Advanced Mode banner" )}
        testID="advanced-mode-banner-dismiss"
      />
      <Body3>{t( "If-youre-an-experienced-user-try-switching-to-Advanced-Mode" )}</Body3>
      <UnderlinedLink
        className="mt-[12px] color-inatGreen"
        accessibilityRole="button"
        onPress={() => setIsDefaultMode( false )}
      >
        {t( "Tap-here-to-switch-to-Advanced-Mode" )}
      </UnderlinedLink>
    </View>
  );
};

export default AdvancedModeBanner;
