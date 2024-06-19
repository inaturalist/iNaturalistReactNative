// @flow

import classNames from "classnames";
import INatIcon from "components/SharedComponents/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3.tsx";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  accessibilityLabel?: string,
  white?: boolean,
  count: number,
  icon?: string,
  testID?: string,
  classNameMargin?: string
}

const ActivityCount = ( {
  accessibilityLabel,
  white,
  count,
  icon,
  testID,
  classNameMargin
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );

  return (
    <View
      className={classNames( "flex-row items-center", classNameMargin )}
      accessible
      accessibilityLabel={
        accessibilityLabel || t( "Intl-number", { val: count || 0 } )
      }
    >
      <INatIcon
        name={icon || "comments"}
        color={white
          ? theme.colors.onPrimary
          : theme.colors.primary}
        size={14}
      />
      <Body3
        className={classNames( "ml-1.5", white && "text-white" )}
        testID={testID}
      >
        {t( "Intl-number", { val: count || 0 } )}
      </Body3>
    </View>
  );
};

export default ActivityCount;
