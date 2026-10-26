import { Body3 } from "components/SharedComponents";
import React, { useMemo } from "react";
import type { Geoprivacy } from "realmModels/geoprivacy";
import {
  GEOPRIVACY_OBSCURED,
  GEOPRIVACY_PRIVATE,
} from "realmModels/geoprivacy";
import { useTranslation } from "sharedHooks";

interface Props {
  geoprivacy?: Geoprivacy;
}

const GeoprivacyStatus = ( {
  geoprivacy,
}: Props ) => {
  const { t } = useTranslation( );

  const displayGeoprivacy = useMemo( ( ) => {
    if ( geoprivacy === GEOPRIVACY_OBSCURED ) {
      return t( "Obscured" );
    }
    if ( geoprivacy === GEOPRIVACY_PRIVATE ) {
      return t( "Private" );
    }
    return t( "Open" );
  }, [geoprivacy, t] );

  return (
    <Body3
      className="mt-3"
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {t( "Geoprivacy-status", { status: displayGeoprivacy } )}
    </Body3>
  );
};

export default GeoprivacyStatus;
