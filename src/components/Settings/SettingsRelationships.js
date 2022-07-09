// @flow

import { Alert, Image, Text, TextInput, View } from "react-native";
import {viewStyles, textStyles} from "../../styles/settings/settings";
import React, { useEffect, useMemo, useCallback } from "react";
import type { Node } from "react";
import { t } from "i18next";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import {useDebounce} from "use-debounce";
import inatjs from "inaturalistjs";
import {Picker} from "@react-native-picker/picker";
import {colors} from "../../styles/global";
import CheckBox from "@react-native-community/checkbox";
import UserSearchInput from "./UserSearchInput";
import useRelationships from "./hooks/useRelationships";

const FOLLOWING = {
  any: "All",
  yes: "Yes",
  no: "No"
};

const TRUSTED = {
  any: "All",
  yes: "Yes",
  no: "No"
};

const SORT_BY = {
  recently_added: "Recently Added",
  earliest_added: "Earliest Added",
  a_to_z: "A to Z",
  z_to_a: "Z to A"
};

type Props = {
  accessToken: string,
  settings: Object,
  onRefreshUser: Function
};

const SettingsRelationships = ( { accessToken, settings, onRefreshUser }: Props ): Node => {
  const [userSearch, setUserSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalUserSearch] = useDebounce( userSearch, 500 );
  const [following, setFollowing] = React.useState( "all" );
  const [trusted, setTrusted] = React.useState( "all" );
  const [sortBy, setSortBy] = React.useState( "desc" );
  const [page, setPage] = React.useState( 1 );
  const [blockedUsers, setBlockedUsers] = React.useState( [] );
  const [mutedUsers, setMutedUsers] = React.useState( [] );

  const [refreshRelationships, setRefreshRelationships] = React.useState( Math.random() );
  let orderBy;
  let order;
  if ( sortBy === "recently_added" ) {
    orderBy = "date";
    order = "desc";
  } else if ( sortBy === "earliest_added" ) {
    orderBy = "date";
    order = "asc";
  } else if ( sortBy === "a_to_z" ) {
    orderBy = "user";
    order = "asc";
  } else if ( sortBy === "z_to_a" ) {
    orderBy = "user";
    order = "desc";
  }
  const relationshipParams = {q: finalUserSearch, following, trusted, order_by: orderBy, order: order, per_page: 10, page, random: refreshRelationships };
  const [relationshipResults, perPage, totalResults] = useRelationships( accessToken, relationshipParams );
  const totalPages = totalResults > 0 && perPage > 0 ? Math.ceil( totalResults / perPage ) : 1;

  useEffect( () => {
    const getBlockedUsers = async () => {
      try {
        const responses = await Promise.all( settings.blocked_user_ids.map( ( userId ) => inatjs.users.fetch( userId, { fields: "icon,login,name"} ) ) );
        setBlockedUsers( responses.map( ( r ) => r.results[0] ) );
      } catch ( e ) {
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve blocked users!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
        return;
      }
    };
    if ( settings.blocked_user_ids.length > 0 ) {
      getBlockedUsers();
    } else {
      setBlockedUsers( [] );
    }

    const getMutedUsers = async () => {
      try {
        const responses = await Promise.all( settings.muted_user_ids.map( ( userId ) => inatjs.users.fetch( userId, { fields: "icon,login,name" } ) ) );
        setMutedUsers( responses.map( ( r ) => r.results[0] ) );
      } catch ( e ) {
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve muted users!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
        return;
      }
    };
    if ( settings.muted_user_ids.length > 0 ) {
      getMutedUsers();
    } else {
      setMutedUsers( [] );
    }
  }, [settings] );


  const updateRelationship = useCallback( async ( relationship, update ) => {
    let response;
    try {
      response = await inatjs.relationships.update(
        { id: relationship.id, relationship: update },
        { api_token: accessToken}
      );
    } catch ( e ) {
      console.error( e );
      Alert.alert(
        "Error",
        "Couldn't update relationship!",
        [{ text: "OK" }],
        {
          cancelable: true
        }
      );
      return;
    }
    console.log( response );
    setRefreshRelationships( Math.random() );
  }, [accessToken] );

  const askToRemoveRelationship = useCallback( ( relationship ) => {
    Alert.alert(
      "Remove Relationship?",
      `You will no longer be following or trusting ${relationship.friendUser.login}.`,
      [
        { text: "Remove Relationship", onPress: async () => {
            let response;
            try {
              response = await inatjs.relationships.delete(
                { id: relationship.id },
                { api_token: accessToken}
              );
            } catch ( e ) {
              console.error( e );
              Alert.alert(
                "Error",
                "Couldn't delete relationship!",
                [{ text: "OK" }],
                {
                  cancelable: true
                }
              );
              return;
            }
            console.log( response );
            setRefreshRelationships( Math.random() );
          } }
      ],
      {
        cancelable: true
      }
    );
  }, [accessToken] );


  const unblockUser = useCallback( async ( user ) => {
    let response;
    try {
      response = await inatjs.users.unblock(
        { id: user.id },
        { api_token: accessToken}
      );
    } catch ( e ) {
      console.error( e );
      Alert.alert(
        "Error",
        "Couldn't unblock user!",
        [{ text: "OK" }],
        {
          cancelable: true
        }
      );
      return;
    }
    console.log( "Unblock", response );
    onRefreshUser();
  }, [accessToken, onRefreshUser] );

  const blockUser = async ( user ) => {
    if ( !user ) {return;}

    let response;
    try {
    response = await inatjs.users.block(
      { id: user.id },
      { api_token: accessToken}
    );
    } catch ( e ) {
      console.error( e );
      Alert.alert(
        "Error",
        "Couldn't block user!",
        [{ text: "OK" }],
        {
          cancelable: true
        }
      );
      return;
    }
    console.log( "Block", response );
    onRefreshUser();
  };

  // $FlowFixMe
  const BlockedUser = useMemo( ( { user } ): Node => {
    return <View style={[viewStyles.row, viewStyles.relationshipRow]}>
      <Image
        style={viewStyles.relationshipImage}
        source={{ uri: user.icon}}
      />
      <View style={viewStyles.column}>
        <Text>{user.login}</Text>
        <Text>{user.name}</Text>
      </View>
      <Pressable style={viewStyles.removeRelationship} onPress={() => unblockUser( user )}><Text>{t( "Unblock" )}</Text></Pressable>
    </View>;
  }, [unblockUser] );

  const unmuteUser = useCallback( async ( user ) => {
    let response;
    try {
      response = await inatjs.users.unmute(
        { id: user.id },
        { api_token: accessToken}
      );
    } catch ( e ) {
      console.error( e );
      Alert.alert(
        "Error",
        "Couldn't unmute user!",
        [{ text: "OK" }],
        {
          cancelable: true
        }
      );
      return;
    }
    console.log( "Unmute", response );
    onRefreshUser();
  }, [accessToken, onRefreshUser] );


  const muteUser = async ( user ) => {
    if ( !user ) {return;}

    let response;
    try {
      response = await inatjs.users.mute(
        { id: user.id },
        { api_token: accessToken}
      );
    } catch ( e ) {
      console.error( e );
      Alert.alert(
        "Error",
        "Couldn't mute user!",
        [{ text: "OK" }],
        {
          cancelable: true
        }
      );
      return;
    }
    console.log( "Mute", response );
    onRefreshUser();
  };

  // $FlowFixMe
  const MutedUser = useMemo( ( {user} ): Node => {
    return <View style={[viewStyles.row, viewStyles.relationshipRow]}>
      <Image
        style={viewStyles.relationshipImage}
        source={{ uri: user.icon}}
      />
      <View style={viewStyles.column}>
        <Text>{user.login}</Text>
        <Text>{user.name}</Text>
      </View>
      <Pressable style={viewStyles.removeRelationship} onPress={() => unmuteUser( user )}><Text>{t( "Unmute" )}</Text></Pressable>
    </View>;
  }, [unmuteUser] );

  // $FlowFixMe
  const Relationship = useMemo( ( {relationship} ): Node => {
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
            <Text>{t( "Following" )}</Text>
          </View>
          <View style={[viewStyles.row, viewStyles.notificationCheckbox]}>
            <CheckBox
              value={relationship.trust}
              onValueChange={( x ) => { updateRelationship( relationship, { trust: !relationship.trust } ); }}
              tintColors={{false: colors.inatGreen, true: colors.inatGreen}}
            />
            <Text>{t( "Trust-with-hidden-coordinates" )}</Text>
          </View>
        </View>
      </View>
      <Text>{t( "Added-on-date", { date: relationship.created_at } )}</Text>
      <Pressable style={viewStyles.removeRelationship} onPress={() => askToRemoveRelationship( relationship )}><Text>{t( "Remove-Relationship" )}</Text></Pressable>
    </View>;
  }, [askToRemoveRelationship, updateRelationship] );


  return (
    // $FlowFixMe
    <View style={viewStyles.column}>
      <Text style={textStyles.title}>{t( "Relationships" )}</Text>
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
      <Text>{t( "Following" )}</Text>
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

      <Text>{t( "Trusted" )}</Text>
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

      <Text>{t( "Sort-By" )}</Text>
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
          // $FlowFixMe
        <Relationship key={relationship.id} relationship={relationship} />
      ) )}
      { totalPages > 1 && <View style={[viewStyles.row, viewStyles.paginationContainer]}>
        <Pressable disabled={page === 1} style={viewStyles.pageButton} onPress={() => setPage( page - 1 )}><Text>&lt;</Text></Pressable>
        {[...Array( totalPages ).keys()].map( ( x ) => (
          <Pressable key={x} style={viewStyles.pageButton} onPress={() => setPage( x + 1 )}><Text style={x + 1 === page ? textStyles.currentPage : null}>{x + 1}</Text></Pressable>
        ) )}
        <Pressable disabled={page === totalPages} style={viewStyles.pageButton} onPress={() => setPage( page + 1 )}><Text>&gt;</Text></Pressable>
      </View>}

      <Text style={textStyles.title}>{t( "Blocked-Users" )}</Text>
      <UserSearchInput userId={0} onUserChanged={( u ) => blockUser( u )} />
      {blockedUsers.map( ( user ) => (
          // $FlowFixMe
        <BlockedUser key={user.id} user={user} />
      ) )}

      <Text style={textStyles.title}>{t( "Muted-Users" )}</Text>
      <UserSearchInput userId={0} onUserChanged={( u ) => muteUser( u )} />
      {mutedUsers.map( ( user ) => (
          // $FlowFixMe
        <MutedUser key={user.id} user={user} />
      ) )}
    </View>
  );
};

export default SettingsRelationships;
