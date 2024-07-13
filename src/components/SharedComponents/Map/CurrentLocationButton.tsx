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
  hasPermissions: boolean | undefined;
  renderPermissionsGate: () => React.JSX.Element;
  requestPermissions: () => void;
}

const CurrentLocationButton = ( {
  currentLocationButtonClassName,
  handlePress,
  showCurrentLocationButton,
  hasPermissions,
  renderPermissionsGate,
  requestPermissions
}: Props ) => {
  const { t } = useTranslation( );
  const onPress = ( ) => {
    if ( !hasPermissions ) {
      requestPermissions( );
    }
    handlePress( );
  };
  return showCurrentLocationButton && (
    <>
      <INatIconButton
        icon="location-crosshairs"
        className={classnames(
          "absolute bottom-5 right-5 bg-white rounded-full",
          currentLocationButtonClassName
        )}
        style={DROP_SHADOW}
        accessibilityLabel={t( "Zoom-to-current-location" )}
        onPress={onPress}
      />
      {renderPermissionsGate( )}
    </>
  );
};

export default CurrentLocationButton;
