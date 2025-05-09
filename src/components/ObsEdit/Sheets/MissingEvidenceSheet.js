// @flow

import {
  TextSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation.ts";

type Props = {
  setShowMissingEvidenceSheet: Function
}

const MissingEvidenceSheet = ( { setShowMissingEvidenceSheet }: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <TextSheet
      headerText={t( "MISSING-EVIDENCE" )}
      texts={[t( "Every-observation-needs" )]}
      setShowSheet={setShowMissingEvidenceSheet}
    />
  );
};

export default MissingEvidenceSheet;
