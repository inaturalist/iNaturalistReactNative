// @flow
import {
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  navToAddID: Function,
  showCommentBox: Function,
  openCommentBox: Function
}

const FloatingButtons = ( {
  navToAddID,
  openCommentBox,
  showCommentBox
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <View
      className="flex-row justify-evenly bottom-[80px] bg-white pt-4 pb-8"
      style={getShadowStyle( {
        shadowColor: colors.black,
        offsetWidth: 0,
        offsetHeight: -3,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        radius: 5,
        elevation: 5
      } )}
    >
      <Button
        text={t( "COMMENT" )}
        onPress={openCommentBox}
        className="mx-3 grow"
        testID="ObsDetail.commentButton"
        disabled={showCommentBox}
        accessibilityHint={t( "Opens-add-comment-modal" )}
      />
      <Button
        text={t( "SUGGEST-ID" )}
        onPress={navToAddID}
        className="mx-3 grow"
        testID="ObsDetail.cvSuggestionsButton"
        accessibilityRole="link"
        accessibilityHint={t( "Navigates-to-suggest-identification" )}
      />
    </View>
  );
};

export default FloatingButtons;
