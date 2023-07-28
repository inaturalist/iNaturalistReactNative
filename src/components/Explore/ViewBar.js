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
  view: string,
  updateView: Function
};

const ViewBar = ( {
  view,
  updateView
}: Props ): Node => {
  const theme = useTheme( );

  const buttonStyle = buttonValue => ( {
    minWidth: 55,
    backgroundColor: buttonValue === view
      ? colors.inatGreen
      : colors.white
  } );

  return (
    <View
      className="bottom-[115px] absolute left-[10px]"
    >
      <SegmentedButtons
        value={view}
        onValueChange={updateView}
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

export default ViewBar;
