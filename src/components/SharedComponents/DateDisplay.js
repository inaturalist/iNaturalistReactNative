// @flow
import classNames from "classnames";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

type Props = {
  label?: string,
  dateString: string,
  classNameMargin?: string
};

const DateDisplay = ( { dateString, label, classNameMargin }: Props ): Node => {
  const { t } = useTranslation( );
  const date = useMemo( ( ) => ( label
    ? `${label} `
    : "" ) + formatApiDatetime( dateString, t ), [dateString, label, t] );

  return (
    <View className={classNames( "flex flex-row items-center", classNameMargin )}>
      <INatIcon
        name="date"
        size={13}
      />
      <Body4 className="ml-[5px]">
        {date}
      </Body4>
    </View>
  );
};

export default DateDisplay;
