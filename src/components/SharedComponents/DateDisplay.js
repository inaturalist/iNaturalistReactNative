// @flow
import classNames from "classnames";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import { formatApiDatetime, formatMonthYearDate } from "sharedHelpers/dateAndTime.ts";
import { useTranslation } from "sharedHooks";

type Props = {
  belongsToCurrentUser?: boolean,
  classNameMargin?: string,
  dateString: string,
  geoprivacy?: string,
  hideIcon?: boolean,
  // Convert the time to the viewer's time zone; otherwise will get displayed
  // the way it is in the string
  inViewerTimeZone?: boolean,
  label?: string,
  maxFontSizeMultiplier?: number,
  taxonGeoprivacy?: string,
  textComponent?: Function,
};

const DateDisplay = ( {
  belongsToCurrentUser,
  classNameMargin,
  dateString,
  geoprivacy,
  hideIcon,
  inViewerTimeZone,
  label,
  maxFontSizeMultiplier = 2,
  taxonGeoprivacy,
  textComponent: TextComponentProp
}: Props ): Node => {
  const { i18n } = useTranslation( );

  let TextComponent = TextComponentProp;
  if ( !TextComponent ) {
    TextComponent = Body4;
  }

  const obscuredDate = geoprivacy === "obscured"
    || taxonGeoprivacy === "obscured"
    || geoprivacy === "private"
    || taxonGeoprivacy === "private";

  const formatDate = useMemo( () => {
    if ( !belongsToCurrentUser && obscuredDate ) {
      return formatMonthYearDate( dateString, i18n );
    }
    return formatApiDatetime( dateString, i18n, { inViewerTimeZone } );
  }, [
    belongsToCurrentUser,
    obscuredDate,
    dateString,
    i18n,
    inViewerTimeZone
  ] );

  const date = useMemo( ( ) => ( label
    ? `${label} `
    : "" ) + formatDate, [formatDate, label] );

  return (
    <View className={classNames( "flex flex-row items-center", classNameMargin )}>
      {!hideIcon && (
        <INatIcon
          name="date"
          size={13}
        />
      )}
      <TextComponent
        className={!hideIcon && "ml-[5px]"}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        {date}
      </TextComponent>
    </View>
  );
};

export default DateDisplay;
