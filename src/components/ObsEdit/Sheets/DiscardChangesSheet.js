// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
  handleClose: Function,
  discardChanges: Function
}

const DiscardChangesSheet = ( {
  handleClose,
  discardChanges
}: Props ): Node => (
  <WarningSheet
    handleClose={handleClose}
    confirm={discardChanges}
    headerText={t( "DISCARD-CHANGES" )}
    text={t( "By-exiting-changes-not-saved" )}
    buttonText={t( "DISCARD-CHANGES" )}
  />
);

export default DiscardChangesSheet;
