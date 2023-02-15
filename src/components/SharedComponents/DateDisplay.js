// @flow
import classnames from "classnames";
import { Body4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useTranslation } from "react-i18next";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";

type Props = {
  label?: string,
  dateString: string,
  marginClassName: string
};

const DateDisplay = ( { dateString, label, marginClassName }: Props ): React.Node => {
  const { t } = useTranslation( );
  return (
    <View className={classnames( "flex flex-row items-center", marginClassName )}>
      <IconMaterial name="watch-later" size={15} />
      <Body4 className="ml-[5px]">
        {( label ? `${label} ` : "" ) + formatApiDatetime( dateString, t )}
      </Body4>
    </View>
  );
};

export default DateDisplay;
