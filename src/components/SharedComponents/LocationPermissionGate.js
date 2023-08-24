// @flow

import PermissionGateContainer, {
  LOCATION_PERMISSIONS
} from "components/SharedComponents/PermissionGateContainer";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  children?: Node,
  permissionNeeded?: boolean,
  onComplete?: Function,
  withoutNavigation?: boolean
};

const LocationPermissionGate = ( {
  children,
  permissionNeeded,
  onComplete,
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
    onComplete={onComplete}
    withoutNavigation={withoutNavigation}
  >
    {children}
  </PermissionGateContainer>
);

export default LocationPermissionGate;
