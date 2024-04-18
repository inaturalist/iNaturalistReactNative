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
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.black, {
  offsetHeight: -3,
  shadowOpacity: 0.2
} );

type Props = {
  navToSuggestions: Function,
  showCommentBox: Function,
  openCommentBox: Function
}

const FloatingButtons = ( {
  navToSuggestions,
  openCommentBox,
  showCommentBox
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <View
      className="flex-row justify-evenly bg-white pt-4 pb-4 px-6"
      style={DROP_SHADOW}
    >
      <Button
        text={t( "COMMENT" )}
        onPress={openCommentBox}
        className="w-1/2 mx-6"
        testID="ObsDetail.commentButton"
        disabled={showCommentBox}
        accessibilityHint={t( "Opens-add-comment-modal" )}
      />
      <Button
        text={t( "SUGGEST-ID" )}
        onPress={navToSuggestions}
        className="w-1/2 mx-6"
        testID="ObsDetail.cvSuggestionsButton"
        accessibilityRole="link"
        accessibilityHint={t( "Shows-identification-suggestions" )}
      />
    </View>
  );
};

export default FloatingButtons;
