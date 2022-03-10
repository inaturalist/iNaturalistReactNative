// @flow

import * as React from "react";
import { Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

import { textStyles, viewStyles } from "../../styles/userProfile/userProfile";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { useUser } from "./hooks/useUser";
import User from "../../models/User";
import UserProjects from "./UserProjects";

const UserProfile = ( ): React.Node => {
  const { params } = useRoute( );
  const { userId } = params;
  const user = useUser( userId );

  const showCount = ( count, label ) => (
    <View style={viewStyles.countBox}>
      <Text style={textStyles.text}>{count}</Text>
      <Text style={textStyles.text}>{label}</Text>
    </View>
  );

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
      <View style={viewStyles.countRow}>
        {showCount( user.observations_count, "Observations" )}
        {showCount( user.species_count, "Species" )}
        {showCount( user.identifications_count, "ID's" )}
        {showCount( user.journal_posts_count, "Journal Posts" )}
      </View>
      <Text>{`Bio: ${user.description}`}</Text>
      <Text>Projects</Text>
      <UserProjects userId={userId} />
      <Text>Following</Text>
      <Text>Followers</Text>
    </ViewWithFooter>
  );
};

export default UserProfile;

