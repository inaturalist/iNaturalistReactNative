// @flow

import { Heading2 } from "components/SharedComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";

const ObsEditHeaderTitle = ( ): Node => {
  const {
    observations
  } = useContext( ObsEditContext );

  // prevent header from flickering if observations haven't loaded yet
  if ( observations.length === 0 ) {
    return null;
  }

  return observations.length === 1
    ? (
      <Heading2
        testID="new-observation-text"
        accessible
        accessibilityRole="header"
      >
        {t( "New-Observation" )}
      </Heading2>
    )
    : (
      <Heading2
        testID="new-observation-text"
        accessible
        accessibilityRole="header"
      >
        {t( "X-Observations", { count: observations.length } )}
      </Heading2>
    );
};

export default ObsEditHeaderTitle;
