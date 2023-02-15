// @flow

import INatIcon from "components/INatIcon";
import { View } from "components/styledComponents";
import * as React from "react";
import CircularProgressBase from "react-native-circular-progress-indicator";
import colors from "styles/tailwindColors";

type Props = {
  color: string,
  completeColor: string,
  progress: number
}

const UploadStatus = ( { color, completeColor, progress }: Props ): React.Node => (
  <View className="relative justify-center items-center">
    {( progress < 0.05 )
      ? <INatIcon className="m-1" name="status-saved" color={colors.darkGray} size={50} />
      : (
        <>
          {( progress < 1 )
            ? <INatIcon className="absolute" name="upload-arrow" color={color} size={25} />
            : <INatIcon className="absolute" name="checkmark" color={completeColor} size={25} />}
          <CircularProgressBase
            value={progress}
            radius={29}
            activeStrokeColor={( progress < 1 ) ? color : completeColor}
            progressValueColor={colors.transparent}
            maxValue={1}
            inActiveStrokeOpacity={0}
            activeStrokeWidth={4}
          />
        </>
      )}
  </View>
);
export default UploadStatus;
