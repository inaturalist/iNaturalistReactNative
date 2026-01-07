import { Body3, Body4 } from "components/SharedComponents";
import { t } from "i18next";
import React from "react";
import type { License, RealmObservation } from "realmModels/types";
import { useLayoutPrefs } from "sharedHooks";

interface Props {
  observation: RealmObservation;
}

const renderRestrictions = ( licenseCode: License | null ) => {
  switch ( licenseCode ) {
    case "cc0":
      return t( "no-rights-reserved-cc0" );
    case "cc-by":
      return t( "attribution-cc-by" );
    case "cc-by-sa":
      return t( "attribution-cc-by-sa" );
    case "cc-by-nc":
      return t( "attribution-cc-by-nc" );
    case "cc-by-nd":
      return t( "attribution-cc-by-nd" );
    case "cc-by-nc-sa":
      return t( "attribution-cc-by-nc-sa" );
    case "cc-by-nc-nd":
      return t( "attribution-cc-by-nc-nd" );
    default:
      return t( "all-rights-reserved" );
  }
};

// lifted from web:
// https://github.com/inaturalist/inaturalist/blob/768b9263931ebeea229bbc47d8442ca6b0377d45/app/webpack/shared/components/observation_attribution.jsx
const Attribution = ( { observation }: Props ) => {
  const { isDefaultMode } = useLayoutPrefs( );
  console.log( "attribution observation", observation );
  const { user } = observation;
  const userName = user
    ? ( user.name || user.login )
    : t( "Unknown--user" );
  const [BodyTag, attributionClass, attributionText] = isDefaultMode
    ? [Body3, "mt-3", t( "Observation-Copyright", {
      userName,
      restrictions: renderRestrictions( observation.license_code ),
    } )]
    : [Body4, "", t( "Observation-Attribution", {
      userName,
      restrictions: renderRestrictions( observation.license_code ),
    } )];

  return (
    <BodyTag className={attributionClass}>
      {attributionText}
    </BodyTag>
  );
};

export default Attribution;
