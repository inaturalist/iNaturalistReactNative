import classNames from "classnames";
import INatIcon from "components/SharedComponents/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

interface Props {
  accessibilityLabel?: string;
  white?: boolean;
  count: number;
  icon?: string;
  testID?: string;
  classNameMargin?: string;
}

const ActivityCount = ( {
  accessibilityLabel,
  white,
  count,
  icon,
  testID,
  classNameMargin,
}: Props ) => {
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
          ? colors.white
          : colors.darkGray}
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
