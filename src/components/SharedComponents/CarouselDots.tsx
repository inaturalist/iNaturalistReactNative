import classnames from "classnames";
import React from "react";
import { View } from "react-native";
import * as uuid from "uuid";

interface CarouselDotsProps {
  length: number;
  index: number;
}

const CarouselDots: React.FC<CarouselDotsProps> = ( { length, index } ) => {
  const dots = React.useMemo( () => Array.from(
    { length },
    () => uuid.v4( ) as string,
  ), [length] );

  return (
    <View
      className="flex flex-row w-full justify-center items-center mb-3"
      pointerEvents="none"
    >
      {dots.map( ( dotKey, idx ) => (
        <View
          key={dotKey}
          className={classnames(
            "rounded-full bg-white m-[2.5]",
            idx === index
              ? "w-[4px] h-[4px]"
              : "w-[2px] h-[2px]",
          )}
        />
      ) )}
    </View>
  );
};

export default CarouselDots;
