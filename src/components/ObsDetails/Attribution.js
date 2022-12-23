// @flow

import { Text } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  observation: Object
}

// lifted from web:
// https://github.com/inaturalist/inaturalist/blob/768b9263931ebeea229bbc47d8442ca6b0377d45/app/webpack/shared/components/observation_attribution.jsx
const Attribution = ( { observation }: Props ): Node => {
  const { user } = observation;
  const licenseCode = observation.license_code;
  const copyrightAttribution = user ? ( user.name || user.login ) : t( "unknown" );

  const renderLicenseCode = ( ) => {
    if ( !licenseCode ) {
      return t( "all-rights-reserved" );
    } if ( licenseCode === "cc0" ) {
      return t( "no-rights-reserved" ) + licenseCode;
    }
    return t( "some-rights-reserved" ) + licenseCode;
  };

  return (
    <Text>
      {t( "Observation-Attribution", {
        attribution: copyrightAttribution,
        licenseCode: renderLicenseCode( )
      } )}
    </Text>
  );
};

export default Attribution;
