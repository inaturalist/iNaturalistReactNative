import fetchSearchResults from "api/search";
import React, { useEffect } from "react";
import {
  Image, Text, TextInput, View
} from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/settings/settings";
import { useDebounce } from "use-debounce";

const UserSearchInput = ( { onUserChanged } ): React.Node => {
  const [hideResults, setHideResults] = React.useState( true );
  const [userSearch, setUserSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalUserSearch] = useDebounce( userSearch, 500 );
  const {
    data: userResults
  } = useAuthenticatedQuery(
    ["fetchSearchResults", finalUserSearch],
    optsWithAuth => fetchSearchResults( {
      q: finalUserSearch,
      sources: "users",
      fields: "user.login,user.name,user.icon"
    }, optsWithAuth )
  );

  useEffect( () => {
    if ( finalUserSearch.length === 0 ) {
      setHideResults( true );
    }
  }, [finalUserSearch] );

  return (
    <View style={viewStyles.column}>
      <View style={viewStyles.row}>
        <TextInput
          accessibilityLabel="Text input field"
          style={viewStyles.textInput}
          onChangeText={v => {
            setHideResults( false );
            setUserSearch( v );
          }}
          value={userSearch}
        />
        <Pressable
          accessibilityRole="button"
          style={viewStyles.clearSearch}
          onPress={() => {
            setHideResults( true );
            onUserChanged( null );
            setUserSearch( "" );
          }}
        >
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "images/clear.png" )}
            accessibilityIgnoresInvertColors
          />
        </Pressable>
      </View>
      {!hideResults && finalUserSearch.length > 0 && userResults?.map( result => (
        <Pressable
          accessibilityRole="button"
          key={result.id}
          style={[viewStyles.row, viewStyles.placeResultContainer]}
          onPress={() => {
            setHideResults( true );
            onUserChanged( result );
            setUserSearch( result.login );
          }}
        >
          <Image
            style={viewStyles.userPic}
            resizeMode="contain"
            source={{ uri: result.icon }}
            accessibilityIgnoresInvertColors
          />
          <Text style={textStyles.resultPlaceName}>{result.login}</Text>
          <Text style={textStyles.resultPlaceType}>{result.name}</Text>
        </Pressable>
      ) )}
    </View>
  );
};

export default UserSearchInput;
