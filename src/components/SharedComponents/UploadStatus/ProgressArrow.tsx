import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  layout: "horizontal" | "vertical";
  color: string;
  progress: number;
  uniqueKey: string;
}

const ProgressArrow = ( {
  layout,
  color,
  progress,
  uniqueKey
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <View
      className={classnames( "absolute", {
        "ml-2 mt-2": layout === "horizontal",
        "mt-2.5": layout === "horizontal" && progress > 0.05 && progress < 1
      } )}
      accessibilityLabel={t( "Upload-in-progress" )}
      testID={`UploadIcon.progress.${uniqueKey}`}
    >
      <INatIcon
        name="upload-arrow"
        color={color}
        size={15}
      />
    </View>
  );
};

export default ProgressArrow;
