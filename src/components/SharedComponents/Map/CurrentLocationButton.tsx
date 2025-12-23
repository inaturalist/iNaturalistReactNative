import classnames from "classnames";
import { INatIconButton } from "components/SharedComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( );

interface Props {
  currentLocationButtonClassName?: string;
  onPress: () => void;
  showCurrentLocationButton?: boolean;
  renderPermissionsGate: () => React.JSX.Element;
}

const CurrentLocationButton = ( {
  currentLocationButtonClassName,
  onPress,
  showCurrentLocationButton,
  renderPermissionsGate,
}: Props ) => {
  const { t } = useTranslation( );
  if ( !showCurrentLocationButton ) {
    return null;
  }
  return (
    <>
      <INatIconButton
        icon="location-crosshairs"
        className={classnames(
          "absolute bottom-5 right-5 bg-white rounded-full",
          currentLocationButtonClassName,
        )}
        style={DROP_SHADOW}
        accessibilityLabel={t( "Zoom-to-current-location" )}
        onPress={onPress}
        testID="Map.CurrentLocationButton"
      />
      {renderPermissionsGate( )}
    </>
  );
};

export default CurrentLocationButton;
