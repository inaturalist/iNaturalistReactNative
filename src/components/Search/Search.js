// @flow

import * as React from "react";
import { FlatList } from "react-native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useFetchSearchResults from "../../sharedHooks/fetchSearchResults";
import InputField from "../SharedComponents/InputField";

const Search = ( ): React.Node => {
  const [q, setQ] = React.useState( "" );
  // choose users or taxa
  const list = useFetchSearchResults( q, "taxa" );
  console.log( list, "list of search results" );

  const renderItem = ( { item } ) => console.log( item );

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
