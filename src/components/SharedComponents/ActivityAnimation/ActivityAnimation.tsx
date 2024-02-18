import { View } from "components/styledComponents";
import { useTheme } from "react-native-paper";

import { Confetti } from "./Confetti";
import IndeterminateProgressBar from "./IndeterminateProgressBar";

const count: number = 30;
const duration: number = 7000;
export default function ActivityAnimation() {
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
}
