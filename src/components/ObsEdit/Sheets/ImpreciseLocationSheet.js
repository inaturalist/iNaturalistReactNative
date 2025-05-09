// @flow

import { REQUIRED_LOCATION_ACCURACY } from "components/LocationPicker/CrosshairCircle";
import { TextSheet } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation.ts";

type Props = {
  setShowImpreciseLocationSheet: Function
}

const ImpreciseLocationSheet = ( { setShowImpreciseLocationSheet }: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <TextSheet
      headerText={t( "LOCATION-TOO-IMPRECISE" )}
      texts={[
        t( "Your-location-uncertainty-is-over-x-km", {
          x: Math.round( REQUIRED_LOCATION_ACCURACY / 1000 )
        } )
      ]}
      setShowSheet={setShowImpreciseLocationSheet}
    />
  );
};

export default ImpreciseLocationSheet;
