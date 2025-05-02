// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import useTranslation from "sharedHooks/useTranslation.ts";

type Props = {
  setShowDiscardSheet: Function,
  hidden?: boolean,
  onDiscard: Function
}

const DiscardChangesSheet = ( {
  setShowDiscardSheet,
  onDiscard,
  hidden
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <WarningSheet
      onPressClose={( ) => setShowDiscardSheet( false )}
      headerText={t( "DISCARD-PHOTOS--question" )}
      text={t( "By-exiting-your-photos-will-not-be-saved" )}
      secondButtonText={t( "CANCEL" )}
      handleSecondButtonPress={( ) => setShowDiscardSheet( false )}
      buttonText={t( "DISCARD" )}
      hidden={hidden}
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
