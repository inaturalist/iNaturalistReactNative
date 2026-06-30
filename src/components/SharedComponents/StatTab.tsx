import { OBSERVATIONS_TAB } from "appConstants/tabs";
import classNames from "classnames";
import Body1 from "components/SharedComponents/Typography/Body1";
import Heading5 from "components/SharedComponents/Typography/Heading5";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  id: string;
  numTotalObservations?: number | null;
  numTotalTaxa?: number | null;
  wrapperClassName?: string;
}

const StatTab = ( {
  id, numTotalObservations, numTotalTaxa, wrapperClassName = "p-3",
}: Props ) => {
  const { t } = useTranslation( );
  let stat: number | null | undefined;
  let label: string;
  if ( id === OBSERVATIONS_TAB ) {
    stat = numTotalObservations;
    label = t( "X-OBSERVATIONS--below-number", { count: numTotalObservations } );
  } else {
    stat = numTotalTaxa;
    label = t( "X-SPECIES--below-number", { count: numTotalTaxa } );
  }
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
