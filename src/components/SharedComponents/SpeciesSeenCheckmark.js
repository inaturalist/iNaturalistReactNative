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
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

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
        user_id: currentUser.id,
        per_page: 0,
        taxon_id: taxonId
      },
      optsWithAuth
    ),
    {
      keepPreviousData: false
    }
  );

  if ( data?.total_results > 0 ) {
    return (
      <View
        className="bg-white rounded-full"
        style={getShadow( theme.colors.primary )}
        testID="SpeciesSeenCheckmark"
      >
        <INatIcon
          name="checkmark-circle"
          size={20}
          color={theme.colors.secondary}
        />
      </View>
    );
  }
  return null;
};

export default SpeciesSeenCheckmark;
