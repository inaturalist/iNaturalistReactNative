import React, {useEffect} from "react";
import {useDebounce} from "use-debounce";
import inatjs from "inaturalistjs";
import {Image, Text, TextInput, View} from "react-native";
import {textStyles, viewStyles} from "../../styles/settings/settings";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";

const UserSearchInput = ( { onUserChanged} ): React.Node => {
  const [hideResults, setHideResults] = React.useState( true );
  const [userResults, setUserResults] = React.useState( [] );
  const [userSearch, setUserSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalUserSearch] = useDebounce( userSearch, 500 );

  useEffect( () => {
    async function findUsers() {
      const response = await inatjs.search( { q: finalUserSearch, sources: "users", per_page: 10} );
      console.log( response );
      setUserResults( response.results );
    }
    if ( finalUserSearch.length > 0 ) {
      findUsers();
    } else {
      setHideResults( true );
    }
  }, [finalUserSearch] );

  return  (
    <View style={viewStyles.column}>
      <View style={viewStyles.row}>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={( v ) => {
            setHideResults( false );
            setUserSearch( v );
          }}
          value={userSearch}
        />
        <Pressable style={viewStyles.clearSearch} onPress={() => {
          setHideResults( true );
          onUserChanged( null );
          setUserSearch( "" );
        }}>
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "../../images/clear.png" )}
          />
        </Pressable>
      </View>
      {!hideResults && finalUserSearch.length > 0 && userResults.map( ( result ) => (
        <Pressable key={result.record.id} style={[viewStyles.row, viewStyles.placeResultContainer]}
                   onPress={() => {
                     setHideResults( true );
                     onUserChanged( result.record );
                     setUserSearch( result.record.login );
                   }}>
          <Image
            style={viewStyles.userPic}
            resizeMode="contain"
            source={{ uri: result.record.icon_url }}
          />
          <Text style={textStyles.resultPlaceName}>{result.record.login}</Text>
          <Text style={textStyles.resultPlaceType}>{result.record.name}</Text>
        </Pressable>
      ) )}
    </View>
  );

};

export default UserSearchInput;
