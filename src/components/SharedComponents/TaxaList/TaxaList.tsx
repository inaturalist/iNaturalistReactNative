import { ActivityIndicator } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { FlatList } from "react-native";
import { useIconicTaxa } from "sharedHooks";

interface Props {
  isLoading: boolean;
  taxa: {}[];
  renderItem: () => React.JSX.Element;
}

const TaxaList = ( {
  isLoading,
  taxa,
  renderItem
}: Props ) => {
  // TODO: how to use Realm with TS
  const iconicTaxa = useIconicTaxa( { reload: false } );

  let data = iconicTaxa;
  if ( taxa && taxa.length > 0 ) {
    // TODO: how to use Realm with TS
    data = taxa;
  }

  if ( isLoading ) {
    return (
      <View className="p-4">
        <ActivityIndicator size={40} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default TaxaList;
