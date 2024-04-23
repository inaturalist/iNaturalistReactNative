// @flow
import classnames from "classnames";
import {
  INatIcon
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import * as React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  uri: Object
}

const ObservationIcon = ( {
  uri
}: Props ): React.Node => {
  const theme = useTheme();
  if ( !uri ) {
    return (
      <View
        className={classnames(
          "w-[62px]",
          "h-[62px]",
          "bg-white",
          "rounded-lg",
          "border-[2px]",
          "justify-center",
          "items-center"
        )}
      >
        <INatIcon
          name="noevidence"
          size={24}
          color={theme.colors.primary}
        />
      </View>
    );
  }

  return (
    <Image
      testID="ObservationIcon.photo"
      className="w-[62px] h-[62px] rounded-lg"
      source={{ uri }}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors
    />
  );
};

export default ObservationIcon;
