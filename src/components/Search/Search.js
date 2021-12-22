// @flow

import * as React from "react";
import { FlatList, Pressable, Text, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useFetchSearchResults from "../../sharedHooks/fetchSearchResults";
import InputField from "../SharedComponents/InputField";
import { viewStyles, imageStyles } from "../../styles/search/search";

const Search = ( ): React.Node => {
  const navigation = useNavigation( );
  const [q, setQ] = React.useState( "" );
  const [queryType, setQueryType] = React.useState( "users" );
  // choose users or taxa
  const list = useFetchSearchResults( q, queryType );

  const renderItem = ( { item } ) => {
    // TODO: make sure TaxonDetails navigates back to Search
    // instead of defaulting back to ObsList (first item in stack)
    const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: item.id } );
    const navToUserProfile = ( ) => navigation.navigate( "UserProfile", { userId: item.id } );
    if ( queryType === "taxa" ) {
      return (
        <Pressable
          onPress={navToTaxonDetails}
          style={viewStyles.row}
        >
          <Image source={{ uri: item.default_photo.square_url }} style={imageStyles.squareImage} />
          <Text>{`${item.preferred_common_name} (${item.rank} ${item.name})`}</Text>
        </Pressable>
      );
    } else {
      return (
        <Pressable
          onPress={navToUserProfile}
          style={viewStyles.row}
        >
          <Image source={{ uri: item.icon }} style={imageStyles.circularImage} />
          <Text>{`${item.login} (${item.name})`}</Text>
        </Pressable>
      );
    }
  };

  return (
    <ViewWithFooter>
      <InputField
        handleTextChange={setQ}
        placeholder="search for taxa or users"
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
