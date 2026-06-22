import classNames from "classnames";
import Body1 from "components/SharedComponents/Typography/Body1";
import Heading5 from "components/SharedComponents/Typography/Heading5";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

export const OBSERVATIONS_TAB = "observations";

interface Props {
  id: string;
  numTotalObservations?: number;
  numTotalTaxa?: number;
  className?: string;
}

const StatTab = ( {
  id, numTotalObservations, numTotalTaxa, className = "p-3",
}: Props ) => {
  const { t } = useTranslation( );
  let stat: number | undefined;
  let label: string;
  if ( id === OBSERVATIONS_TAB ) {
    stat = numTotalObservations;
    label = t( "X-OBSERVATIONS--below-number", { count: numTotalObservations } );
  } else {
    stat = numTotalTaxa;
    label = t( "X-SPECIES--below-number", { count: numTotalTaxa } );
  }
  return (
    <View className={classNames( "items-center", className )}>
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
