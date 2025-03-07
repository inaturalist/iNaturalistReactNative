import { CustomFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback
} from "react";

import IconicSuggestion from "./IconicSuggestion";

const { useRealm } = RealmContext;

const IconicSuggestionsScroll = ( {
  iconicTaxonChosen,
  onIconicTaxonChosen
} ) => {
  const realm = useRealm();

  const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );

  const handleIconicSuggestionPress = useCallback(
    iconicTaxon => {
      onIconicTaxonChosen( iconicTaxon );
    },
    [onIconicTaxonChosen]
  );

  const renderItem = ( { item: taxon } ) => {
    const selected = iconicTaxonChosen?.id === taxon?.id;
    return (
      <IconicSuggestion
        handlePress={() => handleIconicSuggestionPress( taxon )}
        taxon={taxon}
        selected={selected}
      />
    );
  };

  console.log( "iconicTaxonChosen", iconicTaxonChosen );

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
