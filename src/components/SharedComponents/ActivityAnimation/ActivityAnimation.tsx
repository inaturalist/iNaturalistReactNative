import classNames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { useTheme } from "react-native-paper";

import { Confetti } from "./Confetti";
import IndeterminateProgressBar from "./IndeterminateProgressBar";

const iconicTaxonIcons = [
  "plantae",
  "insecta",
  "aves",
  "animalia",
  "fungi",
  "arachnida",
  "mollusca",
  "mammalia",
  "reptilia",
  "amphibia",
  "actinopterygii",
  "chromista",
  "protozoa",
  "unknown"
];

const duration: number = 7000;

export default function ActivityAnimation() {
  const theme = useTheme();
  // Get a random iconic taxon
  const randomIconicTaxon = iconicTaxonIcons[Math.floor( Math.random() * iconicTaxonIcons.length )];
  return (
    <View className="flex-1">
      {/* A view that animates back and forth */}
      <IndeterminateProgressBar
        color={theme.colors.secondary}
      />
      {/* A view that rains confetti of one random iconic taxon */}
      <Confetti key="confetti" count={20} duration={duration}>
        <View
          className={
            classNames(
              "border-inatGreen border-[2px] mr-4 justify-center items-center",
              "h-[36px] w-[36px] rounded-full"
            )
          }
        >
          <INatIcon
            name={`iconic-${randomIconicTaxon}`}
            size={22}
            color={theme.colors.secondary}
          />
        </View>
      </Confetti>
    </View>
  );
}
