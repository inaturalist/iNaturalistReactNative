// @flow

import {
  searchObservations
} from "api/observations";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray );

type Props = {
  taxonId: number
};

const SpeciesSeenCheckmark = ( {
  taxonId
}: Props ): Node => {
  const theme = useTheme( );
  const currentUser = useCurrentUser( );

  const {
    data
  } = useAuthenticatedQuery(
    ["searchObservations", taxonId],
    optsWithAuth => searchObservations(
      {
        user_id: currentUser?.id,
        per_page: 0,
        taxon_id: taxonId
      },
      optsWithAuth
    ),
    {
      enabled: !!taxonId && !!currentUser?.id
    }
  );

  if ( !data?.total_results ) return null;
  if ( data.total_results === 0 ) return null;

  // Styling the outer element to be the white background wasn't looking right
  // in android, so instead we insert smaller white circle behind the icon
  return (
    <View
      className="rounded-full"
      style={DROP_SHADOW}
      testID="SpeciesSeenCheckmark"
    >
      <View className="w-[18px] h-[18px] top-[1px] bg-white absolute rounded-full" />
      <View className="-mt-[0.5px]">
        <INatIcon
          name="checkmark-circle"
          size={20}
          color={theme.colors.secondary}
        />
      </View>
    </View>
  );
};

export default SpeciesSeenCheckmark;
