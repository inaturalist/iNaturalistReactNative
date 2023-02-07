// @flow

import * as React from "react";
import { View } from 'components/styledComponents'
import { Body4 } from 'components/SharedComponents'
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { formatObsListTime } from "sharedHelpers/dateAndTime";
import { useTranslation } from 'react-i18next';

type Props = {
  dateTime: string | typeof undefined
};

const DateDisplay = ( {
  dateTime
}: Props ): React.Node => {
  const { t } = useTranslation( )
  const displayTime = ( ) => {
    if ( dateTime ) {
      return formatObsListTime( dateTime );
    }
    return t("no time given");
  };
console.log(displayTime())
  return (
    <View className="flex flex-row items-center">
      <IconMaterial name="watch-later" size={15} />
      <Body4 className="text-darkGray ml-[5px]">
        {displayTime( )}
      </Body4>
    </View>
  );
};

export default DateDisplay;
