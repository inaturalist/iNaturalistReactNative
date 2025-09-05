import classNames from "classnames";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useMemo } from "react";
import {
  formatApiDatetime,
  formatDifferenceForHumans,
  formatMonthYearDate
} from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

interface Props {
  // Display the date as a difference, or relative date, e.g. "1d" or "3w"
  asDifference?: boolean;
  belongsToCurrentUser?: boolean;
  classNameMargin?: string;
  dateString: string;
  geoprivacy?: string;
  hideIcon?: boolean;
  label?: string;
  // Display the time as literally expressed in the dateString, i.e. don't
  // assume it's in any time zone
  literalTime?: boolean;
  maxFontSizeMultiplier?: number;
  taxonGeoprivacy?: string;
  textComponent?: ( props ) => React.JSX.Element;
  // Convert the time to the this time zone; otherwise display in the
  // current / local time zone
  timeZone?: string;
}

const DateDisplay = ( {
  asDifference,
  belongsToCurrentUser,
  classNameMargin,
  dateString,
  geoprivacy,
  hideIcon,
  label,
  literalTime,
  maxFontSizeMultiplier = 2,
  taxonGeoprivacy,
  textComponent: TextComponentProp,
  timeZone
}: Props ) => {
  const { i18n } = useTranslation( );

  let TextComponent = TextComponentProp;
  if ( !TextComponent ) {
    TextComponent = Body4;
  }

  const dateObscured = geoprivacy === "obscured"
    || taxonGeoprivacy === "obscured"
    || geoprivacy === "private"
    || taxonGeoprivacy === "private";

  const formattedDate = useMemo( () => {
    if ( !belongsToCurrentUser && dateObscured ) {
      return formatMonthYearDate( dateString, i18n );
    }
    if ( asDifference ) {
      return formatDifferenceForHumans( dateString, i18n );
    }
    return formatApiDatetime( dateString, i18n, { literalTime, timeZone } );
  }, [
    asDifference,
    belongsToCurrentUser,
    dateObscured,
    dateString,
    i18n,
    literalTime,
    timeZone
  ] );

  return (
    <View className={classNames( "flex flex-row items-center", classNameMargin )}>
      {!hideIcon && <INatIcon name="date" size={13} />}
      <TextComponent
        className={!hideIcon && "ml-[5px]"}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        { `${label || ""} ${formattedDate}`.trim( ) }
      </TextComponent>
    </View>
  );
};

export default DateDisplay;
