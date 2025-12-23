// @flow

import {
  WarningSheet,
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  onPressClose: Function,
  discardChanges: Function
}

const DiscardChangesSheet = ( {
  onPressClose,
  discardChanges,
}: Props ): Node => (
  <WarningSheet
    onPressClose={onPressClose}
    confirm={discardChanges}
    headerText={t( "DISCARD-CHANGES" )}
    text={t( "By-exiting-changes-not-saved" )}
    buttonText={t( "DISCARD-CHANGES" )}
  />
);

export default DiscardChangesSheet;
