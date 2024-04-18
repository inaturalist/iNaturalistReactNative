// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  ActivityIndicator, Body3, InputField, ViewWrapper
} from "components/SharedComponents";
import {
  Image,
  Pressable,
  View
} from "components/styledComponents";
import * as React from "react";
import {
  FlatList
} from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

const Search = (): React.Node => {
  const navigation = useNavigation();
  const [q, setQ] = React.useState( "" );
  const [queryType, setQueryType] = React.useState( "taxa" );

  const { data, isLoading } = useAuthenticatedQuery(
    ["fetchSearchResults", q],
    optsWithAuth => fetchSearchResults(
      {
        q,
        sources: queryType
      },
      optsWithAuth
    )
  );

  const renderItem = ( { item } ) => {
    // TODO: make sure TaxonDetails navigates back to Search
    // instead of defaulting back to ObsList (first item in stack)
    const navToTaxonDetails = () => navigation.navigate( "TaxonDetails", { id: item.id } );
    const navToUserProfile = () => navigation.navigate( "UserProfile", { userId: item.id } );
    if ( queryType === "taxa" ) {
      const imageUrl = item
        && item.default_photo && { uri: item.default_photo.square_url };
      return (
        <Pressable
          className="py-1.5"
          accessibilityRole="button"
          onPress={navToTaxonDetails}
          testID={`Search.taxa.${item.id}`}
        >
          <Image
            source={imageUrl}
            className="w-full h-full mr-[10px]"
            testID={`Search.${item.id}.photo`}
            accessibilityIgnoresInvertColors
          />
          <Body3>{`${item.preferred_common_name} (${item.rank} ${item.name})`}</Body3>
        </Pressable>
      );
    }
    return (
      <Pressable
        accessibilityRole="button"
        onPress={navToUserProfile}
        className="py-1.5"
        testID={`Search.user.${item.login}`}
      >
        {/* TODO: add an empty icon when user doesn't have an icon */}
        <Image
          source={{ uri: item.icon }}
          className="w-full h-full rounded-lg"
          testID={`Search.${item.login}.photo`}
          accessibilityIgnoresInvertColors
        />
        <Body3>{`${item.login} (${item.name})`}</Body3>
      </Pressable>
    );
  };

  const setTaxaSearch = () => setQueryType( "taxa" );
  const setUserSearch = () => setQueryType( "users" );

  return (
    <ViewWrapper testID="Search">
      <View>
        <Pressable
          onPress={setTaxaSearch}
          testID="Search.taxa"
          accessibilityRole="button"
        >
          <Body3 text="search taxa" />
        </Pressable>
        <Pressable
          onPress={setUserSearch}
          testID="Search.users"
          accessibilityRole="button"
        >
          <Body3 text="search users" />
        </Pressable>
      </View>
      <InputField
        handleTextChange={setQ}
        placeholder={
          queryType === "taxa"
            ? "search for taxa"
            : "search for users"
        }
        text={q}
        type="none"
      />
      {isLoading
        ? (
          <ActivityIndicator />
        )
        : (
          <FlatList
            data={data}
            renderItem={renderItem}
            testID="Search.listView"
          />
        )}
    </ViewWrapper>
  );
};

export default Search;
