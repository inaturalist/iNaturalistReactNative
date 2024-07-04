// @flow

import PermissionGateContainer, {
  LOCATION_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer.tsx";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  children?: Node,
  permissionNeeded?: boolean,
  onModalHide?: Function,
  onPermissionGranted?: Function,
  onPermissionDenied?: Function,
  onPermissionBlocked?: Function,
  withoutNavigation?: boolean
};

const LocationPermissionGate = ( {
  children,
  permissionNeeded,
  onModalHide,
  onPermissionGranted,
  onPermissionDenied,
  onPermissionBlocked,
  withoutNavigation
}: Props ): Node => (
  <PermissionGateContainer
    permissions={LOCATION_PERMISSIONS}
    title={t( "Get-more-accurate-suggestions-create-useful-data" )}
    titleDenied={t( "Please-allow-Location-Access" )}
    body={t( "iNaturalist-uses-your-location-to-give-you" )}
    blockedPrompt={t( "Youve-previously-denied-location-permissions" )}
    buttonText={t( "USE-LOCATION" )}
    icon="map-marker-outline"
    image={require( "images/landon-parenteau-EEuDMqRYbx0-unsplash.jpg" )}
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
