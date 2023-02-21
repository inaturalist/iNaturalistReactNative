// @flow
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import ActivityCount from "./ActivityCount";

type Props = {
    count: number,
    filled?: boolean,
    classNameMargin?: string,
    testID?: string,
    white?: boolean
};

const IdentificationsCount = ( {
  count,
  filled = false,
  classNameMargin,
  testID,
  white
}: Props ): Node => {
  const { t } = useTranslation();
  return (
    <ActivityCount
      accessibilityLabel={t( "x-identifications", { count } )}
      count={count}
      icon={filled ? "identifications-filled-in" : "identifications"}
      classNameMargin={classNameMargin}
      testID={testID}
      white={white}
    />
  );
};

export default IdentificationsCount;
