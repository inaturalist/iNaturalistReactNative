// @flow
import classnames from "classnames";
import { Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { formatObsListTime } from "sharedHelpers/dateAndTime";

type Props = {
  dateTime: string | typeof undefined,
  margin?: string
};

const DateDisplay = ( {
  dateTime,
  margin
}: Props ): React.Node => {
  const { t } = useTranslation( );
  const displayTime = ( ) => {
    if ( dateTime ) {
      return formatObsListTime( dateTime );
    }
    return t( "no time given" );
  };

  return (
    <View className={classnames( "flex flex-row items-center", margin )}>
      <IconMaterial name="schedule" size={15} />
      <Body4 className="text-darkGray ml-[5px]">
        {displayTime( )}
      </Body4>
    </View>
  );
};

export default DateDisplay;
