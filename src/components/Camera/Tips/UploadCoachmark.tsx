import CameraTip from "components/Camera/Tips/CameraTip";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

// Points at the photo library button from its left. Render it inside the
// View that wraps that button. The fixed width is needed because an absolute
// View would otherwise be measured against that narrow wrapper
const UploadCoachmark = ( ) => {
  const { t } = useTranslation( );

  return (
    <CameraTip
      arrow="right"
      className="absolute right-full top-0 bottom-0 mr-2 w-[220px] justify-end"
      testID="UploadCoachmark"
      text={t( "You-can-also-upload-photos-from-your-gallery" )}
    />
  );
};

export default UploadCoachmark;
