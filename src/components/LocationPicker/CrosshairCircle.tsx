import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import colors from "styles/tailwindColors";

import WarningText from "./WarningText";

export const DESIRED_LOCATION_ACCURACY = 100;
export const REQUIRED_LOCATION_ACCURACY = 500_000;

const checkAccuracy = ( accuracy: number ) => {
  if ( accuracy < DESIRED_LOCATION_ACCURACY ) {
    return "pass";
  }
  if ( accuracy < REQUIRED_LOCATION_ACCURACY ) {
    return "acceptable";
  }
  return "fail";
};

interface Props {
  accuracy: number;
}

const CrosshairCircle = ( { accuracy }: Props ) => {
  const accuracyTest = checkAccuracy( accuracy );

  return (
    <View pointerEvents="none">
      <View
        className={
          classnames(
            "h-[254px] w-[254px] bg-transparent rounded-full border-[5px]",
            {
              "border-inatGreen": accuracyTest === "pass",
              "border-warningYellow border-dashed": accuracyTest === "acceptable",
              "border-warningRed": accuracyTest === "fail",
            },
          )
        }
      >
        {/* vertical crosshair */}
        <View className={classnames( "h-[244px] border border-darkGray absolute left-[122px]" )} />
        {/* horizontal crosshair */}
        <View className={classnames( "w-[244px] border border-darkGray absolute top-[122px]" )} />
      </View>
      <View className="absolute left-[234px]">
        {accuracyTest === "pass" && (
          <INatIcon
            name="checkmark-circle"
            size={19}
            color={colors.inatGreen}
          />
        )}
        {accuracyTest === "fail" && (
          <INatIcon
            name="triangle-exclamation"
            size={19}
            color={colors.warningRed}
          />
        )}
      </View>
      <View className="absolute m-auto left-0 right-0 top-[300px]">
        <WarningText accuracyTest={accuracyTest} />
      </View>
    </View>
  );
};

export default CrosshairCircle;
