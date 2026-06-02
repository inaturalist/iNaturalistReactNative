import {
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import {
  useTranslation,
} from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: -3,
  shadowOpacity: 0.2,
} );

interface Props {
  navToSuggestions: ( ) => void;
  showAddCommentSheet: boolean;
  openAddCommentSheet: ( ) => void;
}

const FloatingButtons = ( {
  navToSuggestions,
  openAddCommentSheet,
  showAddCommentSheet,
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <View
      className="flex-row justify-between bg-white pt-4 pb-4 px-6"
      style={DROP_SHADOW}
    >
      <Button
        text={t( "COMMENT" )}
        onPress={openAddCommentSheet}
        className="w-[48%]"
        testID="ObsDetail.commentButton"
        disabled={showAddCommentSheet}
        accessibilityHint={t( "Opens-add-comment-form" )}
      />
      <Button
        text={t( "SUGGEST-ID" )}
        onPress={navToSuggestions}
        className="w-[48%]"
        testID="ObsDetail.cvSuggestionsButton"
        accessibilityRole="link"
        accessibilityHint={t( "Shows-identification-suggestions" )}
      />
    </View>
  );
};

export default FloatingButtons;
