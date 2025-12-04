import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

type Props = {
  iconClasses: Array<string>,
  completeColor: string
};

const UploadCompleteIcon = ( {
  iconClasses,
  completeColor
}: Props ) => (
  <View className={classnames( iconClasses )} testID="UploadStatus.Complete">
    <INatIcon
      size={28}
      name="upload-complete"
      color={completeColor}
    />
  </View>
);
export default UploadCompleteIcon;
