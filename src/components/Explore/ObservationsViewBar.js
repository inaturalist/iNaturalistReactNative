// @flow

import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  hideMap?: boolean,
  layout: string,
  updateObservationsView: Function
};

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6
} );

const ObservationsViewBar = ( {
  hideMap,
  layout,
  updateObservationsView
}: Props ): Node => {
  const buttons = [
    {
      value: "grid",
      icon: "grid",
      accessibilityLabel: "Grid",
      testID: "SegmentedButton.grid"
    },
    {
      value: "list",
      icon: "list",
      accessibilityLabel: "List",
      testID: "SegmentedButton.list"
    }
  ];
  if ( !hideMap ) {
    buttons.unshift( {
      value: "map",
      icon: "map",
      accessibilityLabel: "Map",
      testID: "SegmentedButton.map"
    } );
  }

  return (
    <View
      className="absolute bottom-5 left-5 z-10 h-11 flex-row"
    >
      {buttons.map( ( {
        value, icon, accessibilityLabel, testID
      }, i ) => {
        const checked = value === layout;
        const isFirst = i === 0;
        const isLast = i === buttons.length - 1;
        const outerBorderStyle = {
          borderTopLeftRadius: isFirst
            ? 20
            : 0,
          borderBottomLeftRadius: isFirst
            ? 20
            : 0,
          borderTopRightRadius: isLast
            ? 20
            : 0,
          borderBottomRightRadius: isLast
            ? 20
            : 0
        };
        const spacerStyle = {
          borderRightWidth: isLast
            ? 0
            : 1,
          borderRightColor: colors.lightGray
        };
        const backgroundColor = {
          backgroundColor: checked
            ? colors.inatGreen
            : colors.white
        };

        return (
          <INatIconButton
            key={value}
            accessibilityLabel={accessibilityLabel}
            color={value === layout
              ? colors.white
              : colors.darkGray}
            icon={icon}
            onPress={() => updateObservationsView( value )}
            size={20}
            width={isFirst || isLast
              ? 48
              : 44}
            style={[
              DROP_SHADOW,
              outerBorderStyle,
              spacerStyle,
              backgroundColor
            ]}
            testID={testID}
            backgroundColor={value === layout
              ? colors.inatGreen
              : colors.white}
          />
        );
      } )}
    </View>
  );
};

export default ObservationsViewBar;
