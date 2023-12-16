// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { SegmentedButtons, useTheme } from "react-native-paper";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

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
    <View className="bottom-5 absolute left-5 z-10">
      <SegmentedButtons
        value={observationsView}
        onValueChange={updateObservationsView}
        theme={{
          colors: {
            onSecondaryContainer: colors.white
          }
        }}
        style={getShadowForColor( theme.colors.primary )}
        buttons={[
          {
            style: buttonStyle( "list" ),
            value: "list",
            icon: "hamburger-menu",
            testID: "SegmentedButton.list"
          },
          {
            style: buttonStyle( "grid" ),
            value: "grid",
            icon: "grid",
            testID: "SegmentedButton.grid"
          },
          {
            style: buttonStyle( "map" ),
            value: "map",
            icon: "map",
            testID: "SegmentedButton.map"
          }
        ]}
      />
    </View>
  );
};

export default ObservationsViewBar;
