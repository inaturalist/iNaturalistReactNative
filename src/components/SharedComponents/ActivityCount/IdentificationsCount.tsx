import React from "react";
import useTranslation from "sharedHooks/useTranslation.ts";

import ActivityCount from "./ActivityCount";

interface Props {
    count: number;
    filled?: boolean;
    classNameMargin?: string;
    testID?: string;
    white?: boolean;
}

const IdentificationsCount = ( {
  count,
  filled = false,
  classNameMargin,
  testID,
  white
}: Props ) => {
  const { t } = useTranslation();

  // 03072023 amanda - applying chris' bandaid fix from PR #515: https://github.com/inaturalist/iNaturalistReactNative/pull/515
  // to make sure android devices don't crash on start
  let identificationA11yLabel = "";
  try {
    // not exactly sure why this causes a consistent error every time you run android
    // for the first time...
    identificationA11yLabel = t( "x-identifications", { count } );
  } catch ( e ) {
    console.warn( e );
  }

  return (
    <ActivityCount
      accessibilityLabel={identificationA11yLabel}
      count={count}
      icon={filled
        ? "label"
        : "label-outline"}
      classNameMargin={classNameMargin}
      testID={testID}
      white={white}
    />
  );
};

export default IdentificationsCount;
