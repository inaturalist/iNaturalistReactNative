// @flow
import {
  ButtonBar,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation,
} from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -3,
  shadowOpacity: 0.2,
} );

type Props = {
  navToSuggestions: Function,
  showAddCommentSheet: Function,
  openAddCommentSheet: Function
}

const FloatingButtons = ( {
  navToSuggestions,
  openAddCommentSheet,
  showAddCommentSheet,
}: Props ): Node => {
  const { t } = useTranslation( );

  const buttons = [
    {
      title: t( "COMMENT" ),
      onPress: openAddCommentSheet,
      isPrimary: false,
      testID: "ObsDetail.commentButton",
      disabled: showAddCommentSheet,
      accessibilityHint: "Opens-add-comment-form",
      className: "w-[48%]",
    },
    {
      title: t( "SUGGEST-ID" ),
      onPress: navToSuggestions,
      isPrimary: false,
      testID: "ObsDetail.cvSuggestionsButton",
      accessibilityHint: "Shows-identification-suggestions",
      accessibilityRole: "link",
      className: "w-[48%]",
    },
  ];

  return (
    <View
      className="bg-white"
      style={DROP_SHADOW}
    >
      <ButtonBar
        buttonConfiguration={buttons}
        containerClass="justify-between p-[15px]"
      />
    </View>
  );
};

export default FloatingButtons;
