import { INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

// every view option any screen can offer.
// each caller decides which of these to show and in what order via the `viewOptions` prop.
const VIEW_OPTION_DEFINITIONS = {
  map: {
    icon: "map",
    accessibilityLabel: "Map",
    testID: "SegmentedButton.map",
  },
  grid: {
    icon: "grid",
    accessibilityLabel: "Grid",
    testID: "SegmentedButton.grid",
  },
  list: {
    icon: "list",
    accessibilityLabel: "List",
    testID: "SegmentedButton.list",
  },
};

type ViewOption = keyof typeof VIEW_OPTION_DEFINITIONS;

interface Props {
  layout: string | null;
  updateObservationsView: ( value: ViewOption ) => void;
  viewOptions: ViewOption[];
}

const ObservationsViewBar = ( {
  layout,
  updateObservationsView,
  viewOptions,
}: Props ) => {
  const buttons = viewOptions.map( value => ( {
    value,
    ...VIEW_OPTION_DEFINITIONS[value],
  } ) );

  return (
    <View
      className="absolute bottom-5 left-5 z-10 h-11 flex-row"
    >
      {buttons.map( ( {
        value, icon, accessibilityLabel, testID,
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
            : 0,
        };
        const spacerStyle = {
          borderRightWidth: isLast
            ? 0
            : 1,
          borderRightColor: colors.lightGray,
        };
        const backgroundColor = {
          backgroundColor: checked
            ? colors.inatGreen
            : colors.white,
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
              backgroundColor,
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
