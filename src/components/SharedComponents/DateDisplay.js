// @flow

import { Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";

type Props = {
  dateTime: Date
};

const DateDisplay = ( {
  dateTime
}: Props ): React.Node => (
  <View className="flex flex-row items-center">
    <IconMaterial name="watch-later" size={15} />
    <Body4 className="text-darkGray ml-[5px]">
      {formatApiDatetime( dateTime )}
    </Body4>
  </View>
);

export default DateDisplay;
