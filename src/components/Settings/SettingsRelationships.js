// @flow

import { Picker } from "@react-native-picker/picker";
import fetchRelationships from "api/relationships";
import { fetchRemoteUsers } from "api/users";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import type { Node } from "react";
import React, { useCallback } from "react";
import {
  Alert, Image, ScrollView,
  Text, TextInput, View
} from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/settings/settings";
import { useDebounce } from "use-debounce";

import colors from "../../../tailwind-colors";
import BlockedUser from "./BlockedUser";
import MutedUser from "./MutedUser";
import Relationship from "./Relationship";
import UserSearchInput from "./UserSearchInput";

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
  const [sortBy, setSortBy] = React.useState( "z_to_a" );
  const [page, setPage] = React.useState( 1 );

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
  const relationshipParams = {
    q: finalUserSearch,
    following,
    trusted,
    order_by: orderBy,
    order,
    page,
    random: refreshRelationships
  };

  const {
    data
  } = useAuthenticatedQuery(
    ["fetchRelationships", finalUserSearch],
    optsWithAuth => fetchRelationships( relationshipParams, optsWithAuth )
  );

  const {
    data: blockedUsers
  } = useAuthenticatedQuery(
    ["fetchRemoteUsers", settings.blocked_user_ids],
    optsWithAuth => fetchRemoteUsers( settings.blocked_user_ids, { }, optsWithAuth )
  );

  const {
    data: mutedUsers
  } = useAuthenticatedQuery(
    ["fetchRemoteUsers", settings.muted_user_ids],
    optsWithAuth => fetchRemoteUsers( settings.muted_user_ids, { }, optsWithAuth )
  );

  const relationshipResults = data?.results;
  const perPage = data?.per_page;
  const totalResults = data?.total_results;

  const totalPages = totalResults > 0 && perPage > 0 ? Math.ceil( totalResults / perPage ) : 1;

  const updateRelationship = useCallback( async ( relationship, update ) => {
    let response;
    try {
      response = await inatjs.relationships.update(
        { id: relationship.id, relationship: update },
        { api_token: accessToken }
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

  const askToRemoveRelationship = useCallback( relationship => {
    Alert.alert(
      "Remove Relationship?",
      `You will no longer be following or trusting ${relationship.friendUser.login}.`,
      [
        {
          text: "Remove Relationship",
          onPress: async () => {
            let response;
            try {
              response = await inatjs.relationships.delete(
                { id: relationship.id },
                { api_token: accessToken }
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
          }
        }
      ],
      {
        cancelable: true
      }
    );
  }, [accessToken] );

  const unblockUser = useCallback( async user => {
    let response;
    try {
      response = await inatjs.users.unblock(
        { id: user.id },
        { api_token: accessToken }
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

  const blockUser = async user => {
    if ( !user ) { return; }

    let response;
    try {
      response = await inatjs.users.block(
        { id: user.id },
        { api_token: accessToken }
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

  const unmuteUser = useCallback( async user => {
    let response;
    try {
      response = await inatjs.users.unmute(
        { id: user.id },
        { api_token: accessToken }
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

  const muteUser = async user => {
    if ( !user ) { return; }

    let response;
    try {
      response = await inatjs.users.mute(
        { id: user.id },
        { api_token: accessToken }
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

  return (
    // $FlowFixMe
    <ScrollView contentContainerStyle={viewStyles.column}>
      <Text style={textStyles.title}>{t( "Relationships" )}</Text>
      <View style={viewStyles.row}>
        <TextInput
          style={viewStyles.textInput}
          onChangeText={v => {
            setUserSearch( v );
          }}
          value={userSearch}
        />
        <Pressable
          style={viewStyles.clearSearch}
          onPress={() => {
            setUserSearch( "" );
          }}
        >
          <Image
            style={viewStyles.clearSearch}
            resizeMode="contain"
            source={require( "images/clear.png" )}
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
            onValueChange={( itemValue, _itemIndex ) => setFollowing( itemValue )}
          >
            {Object.keys( FOLLOWING ).map( k => (
              <Picker.Item
                key={k}
                label={FOLLOWING[k]}
                value={k}
              />
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
            onValueChange={( itemValue, _itemIndex ) => setTrusted( itemValue )}
          >
            {Object.keys( TRUSTED ).map( k => (
              <Picker.Item
                key={k}
                label={TRUSTED[k]}
                value={k}
              />
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
            onValueChange={( itemValue, _itemIndex ) => setSortBy( itemValue )}
          >
            {Object.keys( SORT_BY ).map( k => (
              <Picker.Item
                key={k}
                label={SORT_BY[k]}
                value={k}
              />
            ) )}
          </Picker>
        </View>
      </View>

      {relationshipResults?.map( relationship => (
        <Relationship
          key={relationship.id}
          relationship={relationship}
          updateRelationship={updateRelationship}
          askToRemoveRelationship={askToRemoveRelationship}
        />
      ) )}
      { totalPages > 1 && (
      <View style={[viewStyles.row, viewStyles.paginationContainer]}>
        <Pressable
          disabled={page === 1}
          style={viewStyles.pageButton}
          onPress={() => setPage( page - 1 )}
        >
          <Text>&lt;</Text>
        </Pressable>
        {[...Array( totalPages ).keys()].map( x => (
          <Pressable
            key={x}
            style={viewStyles.pageButton}
            onPress={() => setPage( x + 1 )}
          >
            <Text style={x + 1 === page ? textStyles.currentPage : null}>{x + 1}</Text>
          </Pressable>
        ) )}
        <Pressable
          disabled={page === totalPages}
          style={viewStyles.pageButton}
          onPress={() => setPage( page + 1 )}
        >
          <Text>&gt;</Text>
        </Pressable>
      </View>
      )}

      <Text style={textStyles.title}>{t( "Blocked-Users" )}</Text>
      <UserSearchInput userId={0} onUserChanged={u => blockUser( u )} />
      {blockedUsers?.map( user => (
        <BlockedUser key={user.id} user={user} unblockUser={unblockUser} />
      ) )}

      <Text style={textStyles.title}>{t( "Muted-Users" )}</Text>
      <UserSearchInput userId={0} onUserChanged={u => muteUser( u )} />
      {mutedUsers?.map( user => (
        <MutedUser key={user.id} user={user} unmuteUser={unmuteUser} />
      ) )}
    </ScrollView>
  );
};

export default SettingsRelationships;
