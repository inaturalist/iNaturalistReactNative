import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import CircularProgressBase from "react-native-circular-progress-indicator";
import { useTranslation } from "sharedHooks";

type Props = {
  color: string;
  progress: number;
  iconClasses: Array<string>;
  uniqueKey?: string;
}

const UploadProgressIcon = ( {
  color,
  progress,
  iconClasses,
  uniqueKey,
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <View
      className={classnames( iconClasses, "justify-center", "items-center" )}
      accessibilityLabel={t( "Upload-in-progress" )}
      testID={`UploadIcon.progress.${uniqueKey}`}
    >
      <View className="absolute">
        <INatIcon
          name="upload-arrow"
          color={color}
          size={15}
        />
      </View>
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
};

export default UploadProgressIcon;
