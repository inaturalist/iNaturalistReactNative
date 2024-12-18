import { TransparentCircleButton } from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";

interface Props {
  handleClose: ( ) => void;
}

const Close = ( { handleClose }: Props ) => {
  const { t } = useTranslation( );

  return (
    <TransparentCircleButton
      onPress={handleClose}
      accessibilityLabel={t( "Close" )}
      accessibilityHint={t( "Navigates-to-previous-screen" )}
      icon="close"
    />
  );
};

export default Close;
