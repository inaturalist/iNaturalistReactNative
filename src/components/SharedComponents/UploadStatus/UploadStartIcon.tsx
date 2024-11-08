import { INatIconButton } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  color: string;
  uniqueKey: string;
  uploadSingleObservation: ( ) => void;
}

const UploadStartIcon = ( {
  color,
  uniqueKey,
  uploadSingleObservation
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <INatIconButton
      icon="upload-saved"
      color={color}
      size={33}
      onPress={uploadSingleObservation}
      disabled={false}
      accessibilityLabel={t( "Start-upload" )}
      testID={`UploadIcon.start.${uniqueKey}`}
    />
  );
};
export default UploadStartIcon;
