import { CustomFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback
} from "react";

import IconicSuggestion from "./IconicSuggestion";

const { useRealm } = RealmContext;

const IconicSuggestionsScroll = ( {
  onSuggestionChosen
} ) => {
  const realm = useRealm();

  const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );

  const handleSuggestionPress = useCallback(
    suggestion => {
      onSuggestionChosen( suggestion );
    },
    [onSuggestionChosen]
  );

  const renderItem = ( { item: taxon } ) => (
    <IconicSuggestion
      handlePress={() => handleSuggestionPress( taxon )}
      taxon={taxon}
    />
  );

  console.log( "iconicTaxa", iconicTaxa );

  const renderHeader = () => <View className="ml-5" />;
  return (
    <View className="mt-4">
      <CustomFlashList
        ListHeaderComponent={renderHeader}
        horizontal
        renderItem={renderItem}
        estimatedItemSize={160}
        keyExtractor={item => item?.id}
        data={iconicTaxa}
      />
    </View>
  );
};

export default IconicSuggestionsScroll;
