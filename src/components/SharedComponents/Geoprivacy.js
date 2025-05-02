// @flow
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Body4, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import useTranslation from "sharedHooks/useTranslation.ts";

type Props = {
  observation: Object,
};

const Geoprivacy = ( { observation }: Props ): React.Node => {
  const { t } = useTranslation( );

  let geoprivacy = checkCamelAndSnakeCase( observation, "geoprivacy" );

  if ( !geoprivacy ) {
    geoprivacy = t( "No-Location" );
  }

  return (
    <View className="flex-row mt-[11px]">
      <INatIcon name="globe-outline" size={14} />
      <Body4
        className="text-darkGray ml-[5px]"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {geoprivacy}
      </Body4>
    </View>
  );
};

export default Geoprivacy;
