// @flow
import { Body3 } from "components/SharedComponents";
import type { Node } from "react";
import React, { useMemo } from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  geoprivacy: string | null
};

const GeoprivacyStatus = ( {
  geoprivacy,
}: Props ): Node => {
  const { t } = useTranslation( );

  const displayGeoprivacy = useMemo( ( ) => {
    if ( geoprivacy === "obscured" ) {
      return t( "Obscured" );
    } if ( geoprivacy === "private" ) {
      return t( "Private" );
    }
    return t( "Open" );
  }, [geoprivacy, t] );

  let displayPrivacy = displayGeoprivacy;
  if ( displayPrivacy === "private" ) {
    displayPrivacy = "Private";
  }
  if ( displayPrivacy === "obscured" ) {
    displayPrivacy = "Obscured";
  }
  if ( displayPrivacy === null || displayPrivacy === "open" ) {
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
