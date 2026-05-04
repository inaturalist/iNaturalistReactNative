import {
  Body3,
  UnderlinedLink,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

import BannerDismissButton from "./BannerDismissButton";

interface Props {
  onDismiss: ( ) => void;
  onSwitchToAdvancedMode: ( ) => void;
}

const AdvancedModeBanner = ( {
  onDismiss,
  onSwitchToAdvancedMode,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <View className="relative px-[27px] py-[20px]">
      <BannerDismissButton
        accessibilityLabel={t( "Close" )}
        onPress={onDismiss}
        testID="advanced-mode-banner-dismiss"
      />
      <Body3>
        {t( "If-youre-an-experienced-user-try-switching-to-Advanced-Mode" )}
      </Body3>
      <UnderlinedLink
        className="mt-[12px] color-inatGreen"
        accessibilityRole="button"
        onPress={onSwitchToAdvancedMode}
      >
        {t( "Tap-here-to-switch-to-Advanced-Mode" )}
      </UnderlinedLink>
    </View>
  );
};

export default AdvancedModeBanner;
