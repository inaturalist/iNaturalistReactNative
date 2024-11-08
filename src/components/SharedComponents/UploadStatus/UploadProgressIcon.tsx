import classnames from "classnames";
import { View } from "components/styledComponents";
import React from "react";
import CircularProgressBase from "react-native-circular-progress-indicator";

type Props = {
  color: string;
  progress: number;
  showProgressArrow: React.JSX.Element;
  iconClasses: Array<string>;
}

const UploadProgressIcon = ( {
  color,
  progress,
  showProgressArrow,
  iconClasses
}: Props ) => (
  <View className={classnames( iconClasses )}>
    {showProgressArrow( )}
    <CircularProgressBase
      activeStrokeColor={color}
      activeStrokeWidth={2.5}
      inActiveStrokeOpacity={0}
      maxValue={1}
      radius={18}
      showProgressValue={false}
      testID="UploadStatus.CircularProgress"
      value={progress}
    />
  </View>
);

export default UploadProgressIcon;
