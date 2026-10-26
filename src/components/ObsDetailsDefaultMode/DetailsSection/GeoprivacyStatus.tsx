import { Body3 } from "components/SharedComponents";
import React, { useMemo } from "react";
import {
  GEOPRIVACY_OBSCURED,
  GEOPRIVACY_OPEN,
  GEOPRIVACY_PRIVATE,
} from "realmModels/Observation";
import { useTranslation } from "sharedHooks";

type Geoprivacy = null | "open" | "obscured" | "private";

interface Props {
  geoprivacy: Geoprivacy;
}

const GeoprivacyStatus = ( {
  geoprivacy,
}: Props ) => {
  const { t } = useTranslation( );

  const displayGeoprivacy = useMemo( ( ) => {
    if ( geoprivacy === GEOPRIVACY_OBSCURED ) {
      return t( "Obscured" );
    } if ( geoprivacy === GEOPRIVACY_PRIVATE ) {
      return t( "Private" );
    }
    return t( "Open" );
  }, [geoprivacy, t] );

  let displayPrivacy = displayGeoprivacy;
  if ( displayPrivacy === GEOPRIVACY_PRIVATE ) {
    displayPrivacy = "Private";
  }
  if ( displayPrivacy === GEOPRIVACY_OBSCURED ) {
    displayPrivacy = "Obscured";
  }
  if ( displayPrivacy === null || displayPrivacy === GEOPRIVACY_OPEN ) {
    displayPrivacy = "Open";
  }

  return (
    <Body3
      className="mt-3"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {t( "Geoprivacy-status", { status: t( displayPrivacy ) } )}
    </Body3>
  );
};

export default GeoprivacyStatus;
