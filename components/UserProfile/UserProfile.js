// @flow

import * as React from "react";
import { Text, View } from "react-native";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";

import useFetchUser from "./hooks/fetchUser";

const UserProfile = ( ): React.Node => {
  const user = useFetchUser( );
  console.log( user, "user in user profile" );
  // last active date
  // bio
  // following
  // featured observations
  if ( !user ) { return null; }
  return (
    <ViewWithFooter>
      <Text>{`@${user.login}`}</Text>
      <View>
        <UserIcon uri={user.icon_url} large />
        <View>
          <Text>{user.name}</Text>
          <Text>{`iNaturalist ${user.roles[0]}`}</Text>
          <Text>{`Joined: ${user.created_at}`}</Text>
          <Text>Last Active: N/A</Text>
          <Text>{`Affiliation: ${user.site_id}`}</Text>
        </View>
      </View>
      <Text>Bio</Text>
      <Text>Following</Text>
      <Text>Featured Observations</Text>
    </ViewWithFooter>
  );
};

export default UserProfile;

