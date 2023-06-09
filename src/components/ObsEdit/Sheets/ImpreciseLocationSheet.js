// @flow

import { TextSheet } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowImpreciseLocationSheet: Function
}

const ImpreciseLocationSheet = ( { setShowImpreciseLocationSheet }: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <TextSheet
      headerText={t( "LOCATION-TOO-IMPRECISE" )}
      text={t( "Your-location-uncertainty-is-over-4000km" )}
      setShowSheet={setShowImpreciseLocationSheet}
    />
  );
};

export default ImpreciseLocationSheet;
