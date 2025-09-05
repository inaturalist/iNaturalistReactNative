import PermissionGateContainer, {
  LOCATION_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
import { t } from "i18next";
import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  permissionNeeded?: boolean;
  onModalHide?: () => void;
  onPermissionBlocked?: () => void;
  onPermissionDenied?: () => void;
  onPermissionGranted?: () => void;
  withoutNavigation?: boolean;
}

const LocationPermissionGate = ( {
  children,
  permissionNeeded,
  onModalHide,
  onPermissionGranted,
  onPermissionDenied,
  onPermissionBlocked,
  withoutNavigation
}: Props ) => (
  <PermissionGateContainer
    permissions={LOCATION_PERMISSIONS}
    title={t( "Improve-suggestions-by-using-your-location" )}
    titleDenied={t( "Please-allow-Location-Access" )}
    body={t( "iNaturalist-can-use-your-location-to-give-you-better-identification-suggestions" )}
    blockedPrompt={t( "Youve-previously-denied-location-permissions" )}
    buttonText={t( "USE-LOCATION" )}
    icon="map-marker-outline"
    image={require( "images/background/landon-parenteau-EEuDMqRYbx0-unsplash.jpg" )}
    permissionNeeded={permissionNeeded}
    onModalHide={onModalHide}
    onPermissionGranted={onPermissionGranted}
    onPermissionBlocked={onPermissionBlocked}
    onPermissionDenied={onPermissionDenied}
    withoutNavigation={withoutNavigation}
    testID="PermissionGate.Location"
  >
    {children}
  </PermissionGateContainer>
);

export default LocationPermissionGate;
