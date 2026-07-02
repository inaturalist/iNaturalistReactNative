import classNames from "classnames";
import Body1 from "components/SharedComponents/Typography/Body1";
import Heading5 from "components/SharedComponents/Typography/Heading5";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  stat?: number | null;
  label: string;
  wrapperClassName?: string;
}

const StatTab = ( { stat, label, wrapperClassName = "p-3" }: Props ) => {
  const { t } = useTranslation( );
  return (
    <View className={classNames( "items-center", wrapperClassName )}>
      <Body1 className="mb-[4px]">
        {
          typeof ( stat ) === "number"
            ? t( "Intl-number", { val: stat } )
            : "--"
        }
      </Body1>
      <Heading5>{ label }</Heading5>
    </View>
  );
};

export default StatTab;
