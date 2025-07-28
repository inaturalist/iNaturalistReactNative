// @flow

import classnames from "classnames";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  confidence?: number,
  activeColor?: string
};

const ConfidenceInterval = ( { confidence = 0, activeColor = "bg-white" }: Props ): Node => {
  const ActiveDot = (
    <View className={classnames(
      "h-[4px] w-[4px] rounded-full",
      activeColor
    )}
    />
  );
  const Dot = <View className="bg-mediumGray h-[2px] w-[2px] rounded-full mx-[1px]" />;

  const dots = [];

  for ( let key = 1; key <= 5; key += 1 ) {
    dots.push( key <= confidence
      ? React.cloneElement( ActiveDot, { key } )
      : React.cloneElement( Dot, { key } ) );
  }

  return (
    <View className="flex-row justify-between items-center w-[36px]">
      {dots}
    </View>
  );
};

export default ConfidenceInterval;
