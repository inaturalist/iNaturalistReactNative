import { useUploadCoachmark } from "components/Camera/hooks/useOneTimeTip";
import CameraTip from "components/Camera/Tips/CameraTip";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

// Sits above the photo library button, with its arrow on the button's left
// part. The bubble stays left of the round buttons stacked above and clear of
// the shutter beside. Render it inside the View that wraps the photo library
// button; it renders nothing unless the tip is due. AICameraTips dismisses
// it. The fixed width is needed because an absolute View would otherwise be
// measured against that narrow wrapper
const UploadCoachmark = ( ) => {
  const { t } = useTranslation( );
  const { shouldShow } = useUploadCoachmark( );

  if ( !shouldShow ) return null;

  return (
    <CameraTip
      arrow="down-right"
      className="absolute bottom-full right-[44px] w-[220px]"
      testID="UploadCoachmark"
      text={t( "You-can-also-upload-photos-from-your-gallery" )}
    />
  );
};

export default UploadCoachmark;
