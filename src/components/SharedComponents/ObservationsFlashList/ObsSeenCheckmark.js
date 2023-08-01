// @flow

import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";

const { useRealm } = RealmContext;

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  observationUUID: number
};

const ObsSeenCheckmark = ( {
  observationUUID
}: Props ): Node => {
  const realm = useRealm( );
  const theme = useTheme( );
  const userObservation = realm?.objectForPrimaryKey( "Observation", observationUUID );

  if ( !userObservation ) { return null; }
  return (
    <View
      className="absolute top-3 left-3 bg-white rounded-full"
      style={getShadow( theme.colors.primary )}
    >
      <INatIcon
        name="checkmark-circle"
        size={20}
        color={theme.colors.secondary}
      />
    </View>
  );
};

export default ObsSeenCheckmark;
