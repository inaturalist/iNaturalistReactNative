// @flow
import classnames from "classnames";
import {
  INatIcon
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import * as React from "react";
import colors from "styles/tailwindColors";

type Props = {
  photoUri?: string,
  soundUri?: string
}

const ObservationIcon = ( {
  photoUri, soundUri
}: Props ): React.Node => {
  if ( !photoUri && !soundUri ) {
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
          color={colors.darkGray}
        />
      </View>
    );
  }

  if ( !photoUri && soundUri ) {
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
          name="sound"
          size={24}
          color={colors.darkGray}
        />
      </View>
    );
  }

  return (
    <Image
      testID="ObservationIcon.photo"
      className="w-[62px] h-[62px] rounded-lg"
      source={{ uri: photoUri }}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors
    />
  );
};

export default ObservationIcon;
