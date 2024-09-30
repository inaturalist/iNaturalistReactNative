// @flow
import classNames from "classnames";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import { formatApiDatetime, formatMonthYearDate } from "sharedHelpers/dateAndTime.ts";
import { useTranslation } from "sharedHooks";

type Props = {
  label?: string,
  dateString: string,
  classNameMargin?: string,
  geoprivacy?: string,
  taxonGeoprivacy?: string,
  belongsToCurrentUser?: boolean
};

const DateDisplay = ( {
  belongsToCurrentUser,
  classNameMargin,
  dateString,
  geoprivacy,
  label,
  taxonGeoprivacy
}: Props ): Node => {
  const { i18n } = useTranslation( );
  const obscuredDate = geoprivacy === "obscured"
    || taxonGeoprivacy === "obscured"
    || geoprivacy === "private"
    || taxonGeoprivacy === "private";

  const formatDate = useMemo( () => {
    if ( !belongsToCurrentUser && obscuredDate ) {
      return formatMonthYearDate( dateString, i18n );
    }
    return formatApiDatetime( dateString, i18n );
  }, [
    belongsToCurrentUser,
    obscuredDate,
    dateString,
    i18n
  ] );

  const date = useMemo( ( ) => ( label
    ? `${label} `
    : "" ) + formatDate, [formatDate, label] );

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
