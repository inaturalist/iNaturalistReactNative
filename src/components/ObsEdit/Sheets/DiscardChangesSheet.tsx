import {
  WarningSheet,
} from "components/SharedComponents";
import { t } from "i18next";
import React from "react";

interface Props {
  onPressClose: ( ) => void;
  discardChanges: ( ) => void;
}

const DiscardChangesSheet = ( {
  onPressClose,
  discardChanges,
}: Props ) => (
  <WarningSheet
    onPressClose={onPressClose}
    confirm={discardChanges}
    headerText={t( "DISCARD-CHANGES" )}
    text={t( "By-exiting-changes-not-saved" )}
    buttonText={t( "DISCARD-CHANGES" )}
    loading={false}
  />
);

export default DiscardChangesSheet;
