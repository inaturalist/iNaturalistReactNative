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

const CommentsCount = ( {
  count,
  filled = false,
  classNameMargin,
  testID,
  white
}: Props ): Node => {
  const { t } = useTranslation();
  return (
    <ActivityCount
      accessibilityLabel={t( "x-comments", { count } )}
      count={count}
      icon={filled ? "comments" : "comments-outline"}
      classNameMargin={classNameMargin}
      testID={testID}
      white={white}
    />
  );
};

export default CommentsCount;
