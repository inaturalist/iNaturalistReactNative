// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  Body3,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useState
} from "react";
import { FlatList } from "react-native";
import { useAuthenticatedQuery } from "sharedHooks";

const ExploreLocationSearch = ( ): Node => {
  const [query, setQuery] = useState( "" );
  const navigation = useNavigation( );

  const { data: placeList } = useAuthenticatedQuery(
    ["fetchSearchResults", query],
    optsWithAuth => fetchSearchResults(
      {
        q: query,
        sources: "places",
        fields: "place,place.display_name,place.point_geojson"
      },
      optsWithAuth
    )
  );

  const onPlaceSelected = useCallback( async newPlace => {
    navigation.navigate( "Explore", { place: newPlace } );
  }, [navigation] );

  const renderFooter = ( ) => (
    <View className="pb-10" />
  );

  const renderItem = useCallback(
    ( { item } ) => (
      <Pressable
        accessibilityRole="button"
        key={item.id}
        className="p-2 border-[0.5px] border-lightGray flex-row items-center"
        onPress={() => {
          onPlaceSelected( item );
        }}
      >
        <Body3 className="ml-2">{item?.display_name}</Body3>
      </Pressable>
    ),
    [onPlaceSelected]
  );

  return (
    <ViewWrapper className="flex-1">
      <SearchBar
        handleTextChange={setQuery}
        value={query}
        testID="SearchLocation"
        containerClass="my-5 mx-4"
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        data={placeList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default ExploreLocationSearch;
