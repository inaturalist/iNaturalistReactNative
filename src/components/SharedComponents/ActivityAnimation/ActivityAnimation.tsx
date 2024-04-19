import { View } from "components/styledComponents";
import React from "react";
import { useTheme } from "react-native-paper";

import { Confetti } from "./Confetti";
import IndeterminateProgressBar from "./IndeterminateProgressBar";

const count = 30;
const duration = 7000;

const ActivityAnimation = ( ) => {
  const theme = useTheme();
  return (
    <View className="flex-1">
      {/* A view that animates in a loop */}
      <IndeterminateProgressBar
        color={theme.colors.secondary}
      />
      {/* A view that rains confetti of random iconic taxon icons */}
      <Confetti key="confetti" count={count} duration={duration} />
    </View>
  );
};

export default ActivityAnimation;
