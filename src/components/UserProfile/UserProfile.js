// @flow

import * as React from "react";
import { Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import { viewStyles } from "../../styles/userProfile/userProfile";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { useUser } from "./hooks/useUser";
import User from "../../models/User";

const UserProfile = ( ): React.Node => {
  const { params } = useRoute( );
  const { userId } = params;
  const user = useUser( userId );
  console.log( user, "user data" );

  if ( !user ) { return null; }
  return (
    <ViewWithFooter>
      <Text>{User.userHandle( user )}</Text>
      <View style={viewStyles.row} testID={`UserProfile.${userId}`}>
        <UserIcon uri={User.uri( user )} large />
        <View>
          <Text>{user.name}</Text>
          <Text>{`iNaturalist ${user.roles[0]}`}</Text>
          <Text>{`Joined: ${user.created_at}`}</Text>
          <Text>{`Last Active: ${user.updated_at}`}</Text>
          <Text>{`Affiliation: ${user.site_id}`}</Text>
        </View>
      </View>
      <View>
        <Text>{`Species count: ${user.species_count}`}</Text>
        <Text>{`Obs count: ${user.observations_count}`}</Text>
        <Text>{`Journal post count: ${user.journal_posts_count}`}</Text>
        <Text>{`Identifications count: ${user.identifications_count}`}</Text>
      </View>
      <Text>{`Bio: ${user.description}`}</Text>
      <Text>projects</Text>
      <Text>Following</Text>
      <Text>Followers</Text>
    </ViewWithFooter>
  );
};

export default UserProfile;

