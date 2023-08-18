// @flow

import {
  Body3,
  INatIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { useTheme } from "react-native-paper";

const CoordinatesCopiedNotification = ( ): React.Node => {
  const theme = useTheme( );
  return (
    <View
      className="flex flex-row justify-center items-center
      bottom-1/2 bg-white p-[10px] rounded-md w-[268px]"
    >
      <Body3 className="mr-[10px]">
        {t( "Coordinates-copied-to-keyboard" )}
      </Body3>
      <INatIcon
        name="checkmark-circle"
        size={19}
        color={theme.colors.secondary}
      />
    </View>

  );
};
export default CoordinatesCopiedNotification;
