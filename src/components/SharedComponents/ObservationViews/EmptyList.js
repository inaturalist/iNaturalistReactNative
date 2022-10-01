// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";

import { Text } from "../../styledComponents";

const EmptyList = ( ): Node => (
  <Text testID="ObsList.emptyList" className="self-center pt-48">
    {t( "iNaturalist-is-a-community-of-naturalists" )}
  </Text>
);
export default EmptyList;
