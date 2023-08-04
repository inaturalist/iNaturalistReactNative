// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { SegmentedButtons, useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  observationsView: string,
  updateObservationsView: Function
};

const ObservationsViewBar = ( {
  observationsView,
  updateObservationsView
}: Props ): Node => {
  const theme = useTheme( );

  const buttonStyle = buttonValue => ( {
    minWidth: 55,
    backgroundColor: buttonValue === observationsView
      ? colors.inatGreen
      : colors.white
  } );

  return (
    <View
      className="bottom-[165px] absolute left-[10px] z-10"
    >
      <SegmentedButtons
        value={observationsView}
        onValueChange={updateObservationsView}
        theme={{
          colors: {
            onSecondaryContainer: colors.white
          }
        }}
        style={getShadow( theme.colors.primary )}
        buttons={[
          {
            style: buttonStyle( "map" ),
            value: "map",
            icon: "map"
          },
          {
            style: buttonStyle( "list" ),
            value: "list",
            icon: "hamburger-menu"
          },
          {
            style: buttonStyle( "grid" ),
            value: "grid",
            icon: "grid"
          }
        ]}
      />
    </View>
  );
};

export default ObservationsViewBar;
