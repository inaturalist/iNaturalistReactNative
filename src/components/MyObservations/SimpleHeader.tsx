import {
  Body3,
  CircleDots,
  INatIcon,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import AdvancedModeBanner from "./AdvancedModeBanner";
import Announcements from "./Announcements";

interface Props {
  isConnected: boolean;
  obsMissingBasicsExist: boolean;
  numTotalObservations?: number;
}

// Minimum uploaded observations count to show the Advanced Mode onboarding banner
const ADVANCED_MODE_ONBOARDING_MIN_OBSERVATIONS = 100;

const SimpleHeader = ( {
  isConnected,
  obsMissingBasicsExist,
  numTotalObservations,
}: Props ) => {
  const { t } = useTranslation();
  const advancedModeBannerDismissed = useStore(
    state => state.layout.advancedModeBannerDismissed,
  );
  const isDefaultMode = useStore( state => state.layout.isDefaultMode );
  const setAdvancedModeBannerDismissed = useStore(
    state => state.layout.setAdvancedModeBannerDismissed,
  );
  const setIsDefaultMode = useStore( state => state.layout.setIsDefaultMode );

  const currentUser = useCurrentUser();

  const shouldShowAdvancedModeBanner = !!currentUser
      && isDefaultMode
      && numTotalObservations
      && numTotalObservations >= ADVANCED_MODE_ONBOARDING_MIN_OBSERVATIONS
      && !advancedModeBannerDismissed;

  return (
    <>
      <Announcements isConnected={isConnected} />
      {shouldShowAdvancedModeBanner && (
        <AdvancedModeBanner
          onDismiss={( ) => setAdvancedModeBannerDismissed( )}
          onSwitchToAdvancedMode={( ) => setIsDefaultMode( false )}
        />
      )}
      { obsMissingBasicsExist && (
        <View className="flex-row items-center px-[32px] py-[20px]">
          <CircleDots
            color={colors.darkGray}
          >
            <INatIcon
              name="pencil"
              color={colors.darkGray}
              size={15}
            />
          </CircleDots>
          <Body3 className="shrink ml-[20px]">
            { t( "Observations-need-location-date--warning" ) }
          </Body3>
        </View>
      ) }
    </>
  );
};

export default SimpleHeader;
