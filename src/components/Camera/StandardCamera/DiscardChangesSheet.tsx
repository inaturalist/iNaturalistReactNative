import {
  WarningSheet,
} from "components/SharedComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";

interface Props {
  setShowDiscardSheet: ( show: boolean ) => void;
  hidden?: boolean;
  onDiscard: ( ) => void;
}

const DiscardChangesSheet = ( {
  setShowDiscardSheet,
  onDiscard,
  hidden,
}: Props ) => {
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
          onDiscard( );
        }
      }}
    />
  );
};

export default DiscardChangesSheet;
