// @flow
import classNames from "classnames";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  label?: string,
  dateString: string,
  classNameMargin?: string
};

const DateDisplay = ( { dateString, label, classNameMargin }: Props ): React.Node => {
  const { t } = useTranslation( );
  return (
    <View className={classNames( "flex flex-row items-center", classNameMargin )}>
      <INatIcon
        name="date"
        size={13}
      />
      <Body4 className="ml-[5px]">
        {( label
          ? `${label} `
          : "" ) + formatApiDatetime( dateString, t )}
      </Body4>
    </View>
  );
};

export default DateDisplay;
