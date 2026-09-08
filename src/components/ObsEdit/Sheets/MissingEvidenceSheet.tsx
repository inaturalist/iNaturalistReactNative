import {
  TextSheet,
} from "components/SharedComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  setShowMissingEvidenceSheet: ( show: boolean ) => void;
}

const MissingEvidenceSheet = ( { setShowMissingEvidenceSheet }: Props ) => {
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
