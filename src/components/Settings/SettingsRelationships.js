// @flow

import { Picker } from "@react-native-picker/picker";
import { useQueryClient } from "@tanstack/react-query";
import { deleteRelationships, fetchRelationships, updateRelationships } from "api/relationships";
import {
  blockUser, fetchRemoteUsers, muteUser, unblockUser, unmuteUser
} from "api/users";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback } from "react";
import {
  Alert, Image, ScrollView,
  Text, TextInput, View
} from "react-native";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/settings/settings";
import colors from "styles/tailwindColors";
import { useDebounce } from "use-debounce";

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
  settings: Object,
  refetchUserMe: Function
};

const SettingsRelationships = ( { settings, refetchUserMe }: Props ): Node => {
  const [userSearch, setUserSearch] = React.useState( "" );
  // So we'll start searching only once the user finished typing
  const [finalUserSearch] = useDebounce( userSearch, 500 );
  const [following, setFollowing] = React.useState( "any" );
  const [trusted, setTrusted] = React.useState( "any" );
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
    orderBy = "users.login";
    order = "asc";
  } else if ( sortBy === "z_to_a" ) {
    orderBy = "users.login";
    order = "desc";
  }
  const relationshipParams = {
    q: finalUserSearch,
    following,
    trusted,
    order_by: orderBy,
    order,
    page,
    random: refreshRelationships,
    per_page: 10
  };

  const {
    data
  } = useAuthenticatedQuery(
    ["fetchRelationships"],
    optsWithAuth => fetchRelationships( relationshipParams, optsWithAuth )
  );

  const relationshipResults = data?.results;

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

  const queryClient = useQueryClient();

  const mutationOptions = {
    onSuccess: ( ) => {
      queryClient.invalidateQueries( ["fetchUserMe"] );
      refetchUserMe( );
    }
  };

  const blockUserMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => blockUser( id, { }, optsWithAuth ),
    mutationOptions
  );

  const muteUserMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => muteUser( id, { }, optsWithAuth ),
    mutationOptions
  );

  const unblockUserMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => unblockUser( id, { }, optsWithAuth ),
    mutationOptions
  );

  const unmuteUserMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => unmuteUser( id, { }, optsWithAuth ),
    mutationOptions
  );

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth ),
    mutationOptions
  );

  const deleteRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => deleteRelationships( id, optsWithAuth ),
    mutationOptions
  );

  const perPage = data?.per_page;
  const totalResults = data?.total_results;

  const totalPages = totalResults > 0 && perPage > 0
    ? Math.ceil( totalResults / perPage )
    : 1;

  const updateRelationship = useCallback( async ( relationship, update ) => {
    updateRelationshipsMutation.mutate( { id: relationship.id, relationship: update } );
    setRefreshRelationships( Math.random( ) );
  }, [updateRelationshipsMutation] );

  const askToRemoveRelationship = useCallback( relationship => {
    Alert.alert(
      "Remove Relationship?",
      `You will no longer be following or trusting ${relationship.friendUser.login}.`,
      [
        {
          text: "Remove Relationship",
          onPress: ( ) => {
            deleteRelationshipsMutation.mutate( { id: relationship.id } );
            setRefreshRelationships( Math.random() );
          }
        }
      ],
      {
        cancelable: true
      }
    );
  }, [deleteRelationshipsMutation] );

  return (
    // $FlowFixMe
    <ScrollView contentContainerStyle={viewStyles.column}>
      <Text style={textStyles.title}>{t( "Relationships" )}</Text>
      <View style={viewStyles.row}>
        <TextInput
          accessibilityLabel="Text input field"
          style={viewStyles.textInput}
          onChangeText={v => {
            setUserSearch( v );
          }}
          value={userSearch}
        />
        <Pressable
          accessibilityRole="button"
          style={viewStyles.clearSearch}
          onPress={() => {
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
            accessibilityRole="button"
            disabled={page === 1}
            style={viewStyles.pageButton}
            onPress={() => setPage( page - 1 )}
          >
            <Text>&lt;</Text>
          </Pressable>
          {[...Array( totalPages ).keys()].map( x => (
            <Pressable
              accessibilityRole="button"
              key={x}
              style={viewStyles.pageButton}
              onPress={() => setPage( x + 1 )}
            >
              <Text style={x + 1 === page
                ? textStyles.currentPage
                : null}
              >
                {x + 1}
              </Text>
            </Pressable>
          ) )}
          <Pressable
            accessibilityRole="button"
            disabled={page === totalPages}
            style={viewStyles.pageButton}
            onPress={() => setPage( page + 1 )}
          >
            <Text>&gt;</Text>
          </Pressable>
        </View>
      )}
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

      <Text style={textStyles.title}>{t( "Blocked-Users" )}</Text>
      <UserSearchInput
        userId={0}
        onUserChanged={u => {
          if ( u === null ) { return; }
          blockUserMutation.mutate( u.id );
        }}
      />
      {blockedUsers?.map( user => (
        <BlockedUser
          key={user.id}
          user={user}
          unblockUser={( ) => {
            unblockUserMutation.mutate( user.id );
          }}
        />
      ) )}

      <Text style={textStyles.title}>{t( "Muted-Users" )}</Text>
      <UserSearchInput
        userId={0}
        onUserChanged={u => {
          if ( u === null ) { return; }
          muteUserMutation.mutate( u.id );
        }}
      />
      {mutedUsers?.map( user => (
        <MutedUser
          key={user.id}
          user={user}
          unmuteUser={( ) => {
            unmuteUserMutation.mutate( user.id );
          }}
        />
      ) )}
    </ScrollView>
  );
};

export default SettingsRelationships;
