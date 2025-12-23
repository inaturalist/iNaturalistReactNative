import {
  Body3,
  CircleDots,
  INatIcon,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import Announcements from "./Announcements";

export interface Props {
  isConnected: boolean;
}

const SimpleErrorHeader = ( {
  isConnected,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <>
      <Announcements isConnected={isConnected} />
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
    </>
  );
};

export default SimpleErrorHeader;
