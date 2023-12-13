// @flow

import {
  Body3, INatIcon
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const CommentBox = ( ): Node => {
  const comment = useStore( state => state.comment );
  const { t } = useTranslation( );

  return comment && comment.length > 0 && (
    <>
      <Body3 className="my-5 mx-8">
        {t( "Your-identification-will-be-posted-with-the-following-comment" )}
      </Body3>
      <View className="bg-lightGray mx-6 p-5 rounded-lg flex-row items-center">
        <INatIcon
          name="add-comment-outline"
          size={22}
        />
        <Body3 className="ml-4 shrink">{ comment }</Body3>
      </View>
    </>
  );
};

export default CommentBox;
