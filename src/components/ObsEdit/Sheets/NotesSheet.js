// @flow

import { TextInputSheet } from "components/SharedComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowNotesSheet: Function,
  addNotes: Function,
  description: ?string
}

const NotesSheet = ( {
  setShowNotesSheet,
  addNotes,
  description
}: Props ): Node => {
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowNotesSheet( false ),
    [setShowNotesSheet]
  );

  return (
    <TextInputSheet
      handleClose={setShowNotesSheet}
      headerText={t( "NOTES" )}
      snapPoints={[416]}
      placeholder={t( "Add-optional-notes" )}
      initialInput={description}
      confirm={textInput => {
        addNotes( textInput );
        handleClose( );
      }}
    />
  );
};

export default NotesSheet;
