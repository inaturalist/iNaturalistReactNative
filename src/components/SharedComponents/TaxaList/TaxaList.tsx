import { refresh, useNetInfo } from "@react-native-community/netinfo";
import { ActivityIndicator, OfflineNotice } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { FlatList } from "react-native";
import { useIconicTaxa } from "sharedHooks";

interface Props {
  isLoading: boolean;
  taxa: {
    id: string;
  }[];
  renderItem: () => React.JSX.Element;
  taxonQuery: string;
  refetch: () => void;
}

const TaxaList = ( {
  isLoading,
  taxa,
  renderItem,
  taxonQuery,
  refetch
}: Props ) => {
  // TODO: how to use Realm with TS
  const iconicTaxa = useIconicTaxa( { reload: false } );
  const { isConnected } = useNetInfo( );

  let data = iconicTaxa;
  if ( taxa && taxa.length > 0 ) {
    // TODO: how to use Realm with TS
    data = taxa;
  }

  const renderMainContent = () => {
    if ( isLoading ) {
      return (
        <View className="p-4">
          <ActivityIndicator size={40} />
        </View>
      );
    }

    const showIfOffline = taxonQuery.length > 0 && (
      !taxa || ( taxa instanceof Array && taxa.length === 0 )
    );
    if ( showIfOffline && !isConnected ) {
      return (
        <View className="p-4">
          <OfflineNotice
            onPress={() => {
              refresh();
              refetch();
            }}
          />
        </View>
      );
    }

    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    );
  };

  return (
    <View className="flex-1">
      {renderMainContent()}
    </View>
  );
};

export default TaxaList;
