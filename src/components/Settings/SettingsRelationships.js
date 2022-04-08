import {Alert, Image, Text, TextInput, View} from "react-native";
import {viewStyles, textStyles} from "../../styles/settings/settings";
import React, {useCallback, useEffect} from "react";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import {useDebounce} from "use-debounce";
import inatjs from "inaturalistjs";
import {Picker} from "@react-native-picker/picker";
import {colors} from "../../styles/global";
import CheckBox from "@react-native-community/checkbox";
import UserSearchInput from "./UserSearchInput";

const FOLLOWING = {
  all: "All",
  yes: "Yes",
  no: "No"
};

const TRUSTED = {
  all: "All",
  yes: "Yes",
  no: "No"
};

const SORT_BY = {
  recently_added: "Recently Added",
  earliest_added: "Earliest Added",
  a_to_z: "A to Z",
  z_to_a: "Z to A"
};


const SettingsRelationships = ( { accessToken, settings, onRefreshUser } ): React.Node => {
  const [relationshipResults, setRelationshipResults] = React.useState( [] );
  const [userSearch, setUserSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalUserSearch] = useDebounce( userSearch, 500 );
  const [following, setFollowing] = React.useState( "all" );
  const [trusted, setTrusted] = React.useState( "all" );
  const [sortBy, setSortBy] = React.useState( "desc" );
  const [page, setPage] = React.useState( 1 );
  const [totalPages, setTotalPages] = React.useState( 1 );
  const [blockedUsers, setBlockedUsers] = React.useState( [] );
  const [mutedUsers, setMutedUsers] = React.useState( [] );

  const refreshRelationships = useCallback( async () => {
    try {
      const orderBy = ["a_to_z", "z_to_a"].includes( sortBy ) ? "" : "users.login";
      const order = ["z_to_a", "recently_added"].includes( sortBy ) ? "desc" : "asc";
      console.log( {q: finalUserSearch, following, trusted, order_by: orderBy, order: order } );
      const response = await inatjs.relationships.search(
        {q: finalUserSearch, following, trusted, order_by: orderBy, order: order, per_page: 10, page },
        { api_token: accessToken} );
      console.log( response );
      setRelationshipResults( response.results );
      setTotalPages( Math.ceil( response.total_results / response.per_page ) );
    } catch ( e ) {
      console.error( JSON.stringify( e ) );
    }
  } );

  useEffect( () => {
    refreshRelationships();
  }, [accessToken, finalUserSearch, following, trusted, sortBy, page, refreshRelationships] );

  useEffect( () => {
    const getBlockedUsers = async () => {
      try {
        const responses = await Promise.all( settings.blocked_user_ids.map( ( userId ) => inatjs.users.fetch( userId ) ) );
        setBlockedUsers( responses.map( ( r ) => r.results[0] ) );
      } catch ( e ) {
        console.error( e );
      }
    };
    if ( settings.blocked_user_ids.length > 0 ) {
      getBlockedUsers();
    } else {
      setBlockedUsers( [] );
    }

    const getMutedUsers = async () => {
      try {
        const responses = await Promise.all( settings.muted_user_ids.map( ( userId ) => inatjs.users.fetch( userId ) ) );
        setMutedUsers( responses.map( ( r ) => r.results[0] ) );
      } catch ( e ) {
        console.error( e );
      }
    };
    if ( settings.muted_user_ids.length > 0 ) {
      getMutedUsers();
    } else {
      setMutedUsers( [] );
    }
  }, [settings] );


  const updateRelationship = async ( relationship, update ) => {
    const response = await inatjs.relationships.update(
      { id: relationship.id, relationship: update },
      { api_token: accessToken}
    );
    console.log( response );
    refreshRelationships();
  };

  const askToRemoveRelationship = ( relationship ) => {
    Alert.alert(
      "Remove Relationship?",
      `You will no longer be following or trusting ${relationship.friendUser.login}.`,
      [
        { text: "Remove Relationship", onPress: async () => {
            const response = await inatjs.relationships.delete(
              { id: relationship.id },
              { api_token: accessToken}
            );
            console.log( response );
            refreshRelationships();
          } }
      ],
      {
        cancelable: true
      }
    );
  };


  const unblockUser = async ( user ) => {
    const response = await inatjs.users.unblock(
      { id: user.id },
      { api_token: accessToken}
    );
    console.log( "Unblock", response );
    onRefreshUser();
  };

  const blockUser = async ( user ) => {
    if ( !user ) {return;}

    const response = await inatjs.users.block(
      { id: user.id },
      { api_token: accessToken}
    );
    console.log( "Block", response );
    onRefreshUser();
  };


  const BlockedUser = ( {user} ): React.Node => {
    return <View style={[viewStyles.row, viewStyles.relationshipRow]}>
      <Image
        style={viewStyles.relationshipImage}
        source={{ uri: user.icon_url}}
      />
      <View style={viewStyles.column}>
        <Text>{user.login}</Text>
        <Text>{user.name}</Text>
      </View>
      <Pressable style={viewStyles.removeRelationship} onPress={() => unblockUser( user )}><Text>Unblock</Text></Pressable>
    </View>;
  };

  const unmuteUser = async ( user ) => {
    const response = await inatjs.users.unmute(
      { id: user.id },
      { api_token: accessToken}
    );
    console.log( "Unmute", response );
    onRefreshUser();
  };


  const muteUser = async ( user ) => {
    if ( !user ) {return;}

    const response = await inatjs.users.mute(
      { id: user.id },
      { api_token: accessToken}
    );
    console.log( "Mute", response );
    onRefreshUser();
  };


  const MutedUser = ( {user} ): React.Node => {
    return <View style={[viewStyles.row, viewStyles.relationshipRow]}>
      <Image
        style={viewStyles.relationshipImage}
        source={{ uri: user.icon_url}}
      />
      <View style={viewStyles.column}>
        <Text>{user.login}</Text>
        <Text>{user.name}</Text>
      </View>
      <Pressable style={viewStyles.removeRelationship} onPress={() => unmuteUser( user )}><Text>Unmute</Text></Pressable>
    </View>;
  };


  const Relationship = ( {relationship} ): React.Node => {
    return  <View style={[viewStyles.column, viewStyles.relationshipRow]}>
      <View style={viewStyles.row}>
        <Image
          style={viewStyles.relationshipImage}
          source={{ uri: relationship.friendUser.icon_url}}
        />
        <View style={viewStyles.column}>
          <Text>{relationship.friendUser.login}</Text>
          <Text>{relationship.friendUser.name}</Text>
        </View>
        <View style={viewStyles.column}>
          <View style={[viewStyles.row, viewStyles.notificationCheckbox]}>
            <CheckBox
              value={relationship.following}
              onValueChange={( x ) => { updateRelationship( relationship, { following: !relationship.following } ); }}
              tintColors={{false: colors.inatGreen, true: colors.inatGreen}}
            />
            <Text>Following</Text>
          </View>
          <View style={[viewStyles.row, viewStyles.notificationCheckbox]}>
            <CheckBox
              value={relationship.trust}
              onValueChange={( x ) => { updateRelationship( relationship, { trust: !relationship.trust } ); }}
              tintColors={{false: colors.inatGreen, true: colors.inatGreen}}
            />
            <Text>Trust with hidden coordinates</Text>
          </View>
        </View>
      </View>
      <Text>Added on {relationship.created_at}</Text>
      <Pressable style={viewStyles.removeRelationship} onPress={() => askToRemoveRelationship( relationship )}><Text>Remove Relationship</Text></Pressable>
    </View>;
  };


  return (
    <View style={viewStyles.column}>
      <Text style={textStyles.title}>Relationships</Text>
      <View style={viewStyles.row}>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={( v ) => {
            setUserSearch( v );
          }}
          value={userSearch}
        />
        <Pressable style={viewStyles.clearSearch} onPress={() => {
          setUserSearch( "" );
        }}>
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "../../images/clear.png" )}
          />
        </Pressable>
      </View>
      <Text>Following</Text>
      <View style={viewStyles.row}>
        <View style={viewStyles.selectorContainer}>
          <Picker
            style={viewStyles.selector}
            dropdownIconColor={colors.inatGreen}
            selectedValue={following}
            onValueChange={( itemValue, itemIndex ) =>
              setFollowing( itemValue )
            }>
            {Object.keys( FOLLOWING ).map( ( k ) => (
              <Picker.Item
                key={k}
                label={FOLLOWING[k]}
                value={k} />
            ) )}
          </Picker>
        </View>
      </View>

      <Text>Trusted</Text>
      <View style={viewStyles.row}>
        <View style={viewStyles.selectorContainer}>
          <Picker
            style={viewStyles.selector}
            dropdownIconColor={colors.inatGreen}
            selectedValue={trusted}
            onValueChange={( itemValue, itemIndex ) =>
              setTrusted( itemValue )
            }>
            {Object.keys( TRUSTED ).map( ( k ) => (
              <Picker.Item
                key={k}
                label={TRUSTED[k]}
                value={k} />
            ) )}
          </Picker>
        </View>
      </View>

      <Text>Sort By</Text>
      <View style={viewStyles.row}>
        <View style={viewStyles.selectorContainer}>
          <Picker
            style={viewStyles.selector}
            dropdownIconColor={colors.inatGreen}
            selectedValue={sortBy}
            onValueChange={( itemValue, itemIndex ) =>
              setSortBy( itemValue )
            }>
            {Object.keys( SORT_BY ).map( ( k ) => (
              <Picker.Item
                key={k}
                label={SORT_BY[k]}
                value={k} />
            ) )}
          </Picker>
        </View>
      </View>

      {relationshipResults.map( ( relationship ) => (
        <Relationship key={relationship.id} relationship={relationship} />
      ) )}
      { totalPages > 1 && <View style={[viewStyles.row, viewStyles.paginationContainer]}>
        <Pressable disabled={page === 1} style={viewStyles.pageButton} onPress={() => setPage( page - 1 )}><Text>&lt;</Text></Pressable>
        {[...Array( totalPages ).keys()].map( ( x ) => (
          <Pressable key={x} style={viewStyles.pageButton} onPress={() => setPage( x + 1 )}><Text style={x + 1 === page ? textStyles.currentPage : null}>{x + 1}</Text></Pressable>
        ) )}
        <Pressable disabled={page === totalPages} style={viewStyles.pageButton} onPress={() => setPage( page + 1 )}><Text>&gt;</Text></Pressable>
      </View>}

      <Text style={textStyles.title}>Blocked Users</Text>
      <UserSearchInput userId={0} onUserChanged={( u ) => blockUser( u )} />
      {blockedUsers.map( ( user ) => (
        <BlockedUser key={user.id} user={user} />
      ) )}

      <Text style={textStyles.title}>Muted Users</Text>
      <UserSearchInput userId={0} onUserChanged={( u ) => muteUser( u )} />
      {mutedUsers.map( ( user ) => (
        <MutedUser key={user.id} user={user} />
      ) )}
    </View>
  );
};

export default SettingsRelationships;
