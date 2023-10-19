// @flow
import {
  BottomSheet,
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";

type Props = {
    handleClose: Function,
    deleteComment: Function
}

const DeleteCommentSheet = ( {
  handleClose,
  deleteComment
}: Props ): Node => (
  <BottomSheet
    handleClose={handleClose}
    headerText={t( "DELETE-COMMENT" )}
    snapPoints={[140]}
  >
    <View className="flex-row justify-evenly mx-[15px] my-[25px]">
      <Button
        text={t( "CANCEL" )}
        onPress={( ) => {
          handleClose();
        }}
        className="mx-2"
        testID="ObsDetail.DeleteCommentSheet.cancel"
        accessibilityRole="button"
        accessibilityHint={t( "Closes-delete-comment-sheet" )}
        level="secondary"
      />
      <Button
        text={t( "DELETE" )}
        onPress={( ) => {
          deleteComment( false );
          handleClose();
        }}
        className="mx-2 grow"
        testID="ObsDetail.DeleteCommentSheet.delete"
        accessibilityRole="button"
        accessibilityHint={t( "Deletes-comment" )}
        level="warning"
      />
    </View>
  </BottomSheet>
);

export default DeleteCommentSheet;
