import classnames from "classnames";
import { Heading4 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

// One-time coachmark pointing at the AI camera's gallery button. Positioned
// against the phone button container in AICameraButtons: the gallery button
// sits 6px above that container's bottom and is 62px tall, and the arrow tip
// ends 14px above the button, as in the design.
// pointerEvents="none" so it never blocks the flip, flash or close buttons
// it overlaps; AICamera dismisses it on the user's next touch anywhere
const UploadCoachmark = ( ) => {
  const { t } = useTranslation( );
  return (
    <View
      className="absolute left-0 right-0 bottom-[82px] items-end"
      pointerEvents="none"
      testID="UploadCoachmark"
    >
      <View className="bg-white rounded-2xl px-[18px] py-[10px]">
        <Heading4>{t( "YOU-CAN-ALSO-UPLOAD-PHOTOS" )}</Heading4>
      </View>
      <View
        className={classnames(
          "mr-6",
          "border-l-[18px] border-r-[18px] border-x-[#00000000]",
          "border-t-[14px] border-t-white",
        )}
      />
    </View>
  );
};

export default UploadCoachmark;
