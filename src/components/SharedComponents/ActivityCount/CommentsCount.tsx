import React from "react";
import useTranslation from "sharedHooks/useTranslation";

import ActivityCount from "./ActivityCount";

interface Props {
    count: number;
    filled?: boolean;
    classNameMargin?: string;
    testID?: string;
    white?: boolean;
}

const CommentsCount = ( {
  count,
  filled = false,
  classNameMargin,
  testID,
  white,
}: Props ) => {
  const { t } = useTranslation();

  // 03072023 amanda - applying chris' bandaid fix from PR #515: https://github.com/inaturalist/iNaturalistReactNative/pull/515
  // to make sure android devices don't crash on start
  let commentA11yLabel = "";
  try {
    // not exactly sure why this causes a consistent error every time you run android
    // for the first time...
    commentA11yLabel = t( "x-comments", { count } );
  } catch ( e ) {
    console.warn( e );
  }

  return (
    <ActivityCount
      accessibilityLabel={commentA11yLabel}
      count={count}
      icon={filled
        ? "comments"
        : "comments-outline"}
      classNameMargin={classNameMargin}
      testID={testID}
      white={white}
    />
  );
};

export default CommentsCount;
