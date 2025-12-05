import type { ApiTaxon } from "api/types";
import { CustomFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback
} from "react";

import IconicSuggestion from "./IconicSuggestion";

const { useRealm } = RealmContext;

type Props = {
  iconicTaxonChosen?: ApiTaxon;
  onIconicTaxonChosen: ( taxon: ApiTaxon ) => void;
}

const IconicSuggestionsScroll = ( {
  iconicTaxonChosen,
  onIconicTaxonChosen
}: Props ) => {
  const realm = useRealm();

  const iconicTaxa = realm?.objects( "Taxon" ).filtered( "isIconic = true" );

  const handleIconicSuggestionPress = useCallback(
    ( iconicTaxon: ApiTaxon ) => {
      onIconicTaxonChosen( iconicTaxon );
    },
    [onIconicTaxonChosen]
  );

  const renderItem = ( { item: taxon }: { item: ApiTaxon } ) => {
    const selected = iconicTaxonChosen?.id === taxon?.id;
    return (
      <IconicSuggestion
        handlePress={() => handleIconicSuggestionPress( taxon )}
        taxon={taxon}
        selected={selected}
      />
    );
  };

  const renderHeader = () => <View className="ml-4" />;
  return (
    <View className="mt-4">
      <CustomFlashList
        ListHeaderComponent={renderHeader}
        horizontal
        renderItem={renderItem}
        keyExtractor={( item: ApiTaxon ) => String( item?.id )}
        data={iconicTaxa}
      />
    </View>
  );
};

export default IconicSuggestionsScroll;
