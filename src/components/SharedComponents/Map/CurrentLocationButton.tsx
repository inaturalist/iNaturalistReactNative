import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray );

interface Props {
  currentLocationButtonClassName?: string;
  handlePress: () => void;
  showCurrentLocationButton?: boolean;
}

const CurrentLocationButton = ( {
  currentLocationButtonClassName,
  handlePress,
  showCurrentLocationButton
}: Props ) => {
  const { t } = useTranslation( );
  return showCurrentLocationButton && (
    <INatIconButton
      icon="location-crosshairs"
      className={classnames(
        "absolute bottom-5 right-5 bg-white rounded-full",
        currentLocationButtonClassName
      )}
      style={DROP_SHADOW}
      accessibilityLabel={t( "Zoom-to-current-location" )}
      onPress={handlePress}
    />
  );
};

export default CurrentLocationButton;
