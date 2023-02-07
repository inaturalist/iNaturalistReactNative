// @flow

import INatIcon from "components/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  color: string,
  count: number,
  icon?: string,
  testID?: string
}

const ActivityCount = ( {
  accessibilityHint,
  accessibilityLabel,
  color,
  count,
  icon,
  testID
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const defaultColor = theme.colors.primary;
  return (
    <View
      className="flex-row items-center"
      accessible
      accessibilityLabel={accessibilityLabel || t( "Intl-number", { val: count || 0 } )}
      accessibilityHint={accessibilityHint}
    >
      <INatIcon
        name={icon || "comments-filled-in"}
        color={color || defaultColor}
        size={14}
      />
      <Body3
        className="ml-1.5"
        testID={testID}
        style={{ color: color || defaultColor }}
      >
        {t( "Intl-number", { val: count || 0 } )}
      </Body3>
    </View>
  );
};

export default ActivityCount;
