import {
  Body1,
  Heading5
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

export const OBSERVATIONS_TAB = "observations";

const StatTab = ( { id, numTotalObservations, numTotalTaxa } ) => {
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
    <View className="items-center p-3">
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
