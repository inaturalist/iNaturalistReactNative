import type { Node } from "react";
import React from "react";
import { ProgressBar } from "react-native-paper";
import colors from "styles/tailwindColors";

const PROGRESS_BAR_STYLE = { backgroundColor: "transparent" };

interface Props {
  progress: number;
}

const UploadProgressBar = ( { progress }: Props ): Node => (
  <ProgressBar
    progress={progress}
    color={colors.inatGreen}
    style={PROGRESS_BAR_STYLE}
    visible={progress > 0}
  />
);

export default UploadProgressBar;
