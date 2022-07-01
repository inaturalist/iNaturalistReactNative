// @flow

import * as React from "react";
import { FlatList, Pressable, Text, Image, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";
import InputField from "../SharedComponents/InputField";
import { viewStyles, imageStyles } from "../../styles/search/search";
import PlaceholderText from "../PlaceholderText";

const Search = ( ): React.Node => {
  const navigation = useNavigation( );
  const [q, setQ] = React.useState( "" );
  const [queryType, setQueryType] = React.useState( "taxa" );
  // choose users or taxa
  const list = useRemoteSearchResults( q, queryType, "all" );

  const renderItem = ( { item } ) => {
    // TODO: make sure TaxonDetails navigates back to Search
    // instead of defaulting back to ObsList (first item in stack)
    const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: item.id } );
    const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: item.id } );
    if ( queryType === "taxa" ) {
      const imageUrl = ( item && item.default_photo ) && { uri: item.default_photo.square_url };
      return (
        <Pressable
          onPress={navToTaxonDetails}
          style={viewStyles.row}
          testID={`Search.taxa.${item.id}`}
        >
          <Image source={imageUrl} style={imageStyles.squareImage} testID={`Search.${item.id}.photo`} />
          <Text>{`${item.preferred_common_name} (${item.rank} ${item.name})`}</Text>
        </Pressable>
      );
    } else {
      return (
        <Pressable
          onPress={navToUserProfile}
          style={viewStyles.row}
          testID={`Search.user.${item.login}`}
        >
          {/* TODO: add an empty icon when user doesn't have an icon */}
          <Image source={{ uri: item.icon }} style={imageStyles.circularImage} testID={`Search.${item.login}.photo`}/>
          <Text>{`${item.login} (${item.name})`}</Text>
        </Pressable>
      );
    }
  };

  const setTaxaSearch = ( ) => setQueryType( "taxa" );
  const setUserSearch = ( ) => setQueryType( "users" );

  return (
    <ViewWithFooter>
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
        placeholder={queryType === "taxa" ? "search for taxa" : "search for users"}
        text={q}
        type="none"
      />
        <FlatList
          data={list}
          renderItem={renderItem}
          testID="Search.listView"
        />
    </ViewWithFooter>
  );
};

export default Search;
