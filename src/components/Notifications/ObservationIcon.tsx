import type { ApiObservation } from "api/types";
import classnames from "classnames";
import {
  INatIcon,
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import * as React from "react";
import colors from "styles/tailwindColors";

interface Props {
  observation?: ApiObservation;
}

const ObservationIcon = ( {
  observation,
}: Props ) => {
  const photoUri = observation?.observation_photos?.[0]?.photo?.url;
  const hasSound = ( observation?.observation_sounds?.length || 0 ) > 0;
  if ( !photoUri && !hasSound ) {
    return (
      <View
        className={classnames(
          "w-[62px]",
          "h-[62px]",
          "bg-white",
          "rounded-lg",
          "border-[2px]",
          "justify-center",
          "items-center",
        )}
      >
        <INatIcon
          name="noevidence"
          size={24}
          color={String( colors?.darkGray )}
        />
      </View>
    );
  }

  if ( !photoUri && hasSound ) {
    return (
      <View
        className={classnames(
          "w-[62px]",
          "h-[62px]",
          "bg-white",
          "rounded-lg",
          "border-[2px]",
          "justify-center",
          "items-center",
        )}
      >
        <INatIcon
          name="sound"
          size={24}
          color={String( colors?.darkGray )}
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
