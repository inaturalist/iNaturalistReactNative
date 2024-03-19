// @flow
import WarningSheet from "components/SharedComponents/Sheets/WarningSheet";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  setShowUnfollowSheet: Function,
}

const UnfollowSheet = ( { setShowUnfollowSheet }: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <WarningSheet
      handleClose={( ) => setShowUnfollowSheet( false )}
      secondButtonText={t( "CANCEL" )}
      buttonType="warning"
      headerText={t( "UNFOLLOW-USER" )}
      buttonText={t( "UNFOLLOW" )}
      confirm={( ) => {
        setShowUnfollowSheet( false );
      }}
    />
  );
};

export default UnfollowSheet;
