import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { FlatList } from "react-native";
import { useIconicTaxa } from "sharedHooks";

interface Props {
  isLoading: boolean;
  taxa: {}[];
  renderItem: () => React.JSX.Element;
  renderFooter?: () => React.JSX.Element;
}

const TaxaList = ( {
  isLoading,
  taxa,
  renderItem,
  renderFooter
}: Props ) => {
  // TODO: how to use Realm with TS
  const iconicTaxa = useIconicTaxa( { reload: false } );

  let data = iconicTaxa;
  if ( taxa && taxa.length > 0 ) {
    // TODO: how to use Realm with TS
    data = taxa;
  }

  return (
    <View>
      {isLoading
        ? (
          <View className="p-4">
            <ActivityIndicator size={40} />
          </View>
        )
        : (
          <FlatList
            keyboardShouldPersistTaps="always"
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListFooterComponent={renderFooter}
          />
        )}
    </View>
  );
};

export default TaxaList;
