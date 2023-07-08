// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowDiscardSheet: Function,
  hide?: boolean,
  onDiscard: Function
}

const DiscardChangesSheet = ( {
  setShowDiscardSheet,
  onDiscard,
  hide
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <WarningSheet
      handleClose={( ) => setShowDiscardSheet( false )}
      snapPoints={[180]}
      headerText={t( "DISCARD-PHOTOS" )}
      text={t( "By-exiting-your-photos-will-not-be-saved" )}
      secondButtonText={t( "CANCEL" )}
      handleSecondButtonPress={( ) => setShowDiscardSheet( false )}
      buttonText={t( "DISCARD" )}
      hide={hide}
      confirm={( ) => {
        setShowDiscardSheet( false );
        if ( onDiscard ) {
          onDiscard();
        }
      }}
    />
  );
};

export default DiscardChangesSheet;
