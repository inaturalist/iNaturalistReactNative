// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import PlaceholderText from "components/PlaceholderText";
import { ActivityIndicator, InputField, ViewWrapper } from "components/SharedComponents";
import * as React from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View
} from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { imageStyles, viewStyles } from "styles/search/search";

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
          accessibilityRole="button"
          onPress={navToTaxonDetails}
          style={viewStyles.row}
          testID={`Search.taxa.${item.id}`}
        >
          <Image
            source={imageUrl}
            style={imageStyles.squareImage}
            testID={`Search.${item.id}.photo`}
            accessibilityIgnoresInvertColors
          />
          <Text>{`${item.preferred_common_name} (${item.rank} ${item.name})`}</Text>
        </Pressable>
      );
    }
    return (
      <Pressable
        accessibilityRole="button"
        onPress={navToUserProfile}
        style={viewStyles.row}
        testID={`Search.user.${item.login}`}
      >
        {/* TODO: add an empty icon when user doesn't have an icon */}
        <Image
          source={{ uri: item.icon }}
          style={imageStyles.circularImage}
          testID={`Search.${item.login}.photo`}
          accessibilityIgnoresInvertColors
        />
        <Text>{`${item.login} (${item.name})`}</Text>
      </Pressable>
    );
  };

  const setTaxaSearch = () => setQueryType( "taxa" );
  const setUserSearch = () => setQueryType( "users" );

  return (
    <ViewWrapper testID="Search">
      <View style={viewStyles.toggleRow}>
        <Pressable
          onPress={setTaxaSearch}
          testID="Search.taxa"
          accessibilityRole="button"
        >
          <PlaceholderText text="search taxa" />
        </Pressable>
        <Pressable
          onPress={setUserSearch}
          testID="Search.users"
          accessibilityRole="button"
        >
          <PlaceholderText text="search users" />
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
