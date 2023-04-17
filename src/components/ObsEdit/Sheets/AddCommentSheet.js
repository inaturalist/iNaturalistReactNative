// @flow

import { TextInputSheet } from "components/SharedComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  setShowAddCommentSheet: Function,
  addComment: Function
}

const AddCommentSheet = ( {
  setShowAddCommentSheet,
  addComment
}: Props ): Node => {
  const { t } = useTranslation( );

  const handleClose = useCallback(
    ( ) => setShowAddCommentSheet( false ),
    [setShowAddCommentSheet]
  );

  return (
    <TextInputSheet
      handleClose={setShowAddCommentSheet}
      headerText={t( "ADD-OPTIONAL-COMMENT" )}
      snapPoints={[416]}
      placeholder={t( "You-can-tell-from-the-cool-remark" )}
      confirm={textInput => {
        addComment( textInput );
        handleClose( );
      }}
    />
  );
};

export default AddCommentSheet;
