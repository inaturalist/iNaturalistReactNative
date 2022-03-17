// @flow

import * as React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import HTML from "react-native-render-html";

import { textStyles, viewStyles } from "../../styles/userProfile/userProfile";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { useUser } from "./hooks/useUser";
import User from "../../models/User";
import UserProjects from "./UserProjects";
import CustomHeader from "../SharedComponents/CustomHeader";
// import useNetworkSite from "./hooks/useNetworkSite";
import RoundGreenButton from "../SharedComponents/Buttons/RoundGreenButton";
import updateRelationship from "./helpers/updateRelationship";


const UserProfile = ( ): React.Node => {
  const { params } = useRoute( );
  const { userId } = params;
  const { user, currentUser } = useUser( userId );
  const { width } = useWindowDimensions( );
  // const site = useNetworkSite( );

  const showCount = ( count, label ) => (
    <View style={viewStyles.countBox}>
      <Text style={textStyles.text}>{count}</Text>
      <Text style={textStyles.text}>{label}</Text>
    </View>
  );

  if ( !user ) { return null; }
  console.log( user, "user profile" );

  const showUserRole = user.roles.length > 0 && <Text>{`iNaturalist ${user.roles[0]}`}</Text>;

  const followUser = ( ) => updateRelationship( { id: userId, relationship: { following: true } } );

  return (
    <ViewWithFooter>
      <CustomHeader headerText={User.userHandle( user )} />
      <View style={viewStyles.row} testID={`UserProfile.${userId}`}>
        <UserIcon uri={User.uri( user )} large />
        <View>
          <Text>{user.name}</Text>
          {showUserRole}
          <Text>{`Joined: ${user.created_at}`}</Text>
          <Text>{`Last Active: ${user.updated_at}`}</Text>
          <Text>{`Affiliation: ${user.site_id}`}</Text>
        </View>
      </View>
      {!currentUser && (
        <View style={viewStyles.buttonRow}>
          <View style={viewStyles.button}>
            <RoundGreenButton buttonText="Follow" handlePress={followUser} testID="UserProfile.followButton" />
          </View>
          <View style={viewStyles.button}>
            <RoundGreenButton buttonText="Messages" handlePress={( ) => console.log( "open messages" )} testID="UserProfile.messagesButton" />
          </View>
        </View>
      )}
      <View style={viewStyles.countRow}>
        {showCount( user.observations_count, "Observations" )}
        {showCount( user.species_count, "Species" )}
        {showCount( user.identifications_count, "ID's" )}
        {showCount( user.journal_posts_count, "Journal Posts" )}
      </View>
      <Text>Bio:</Text>
      <HTML
        contentWidth={width}
        source={{ html: user.description }}
      />
      <Text>Projects</Text>
      <UserProjects userId={userId} />
      <Text>Following</Text>
      <Text>Followers</Text>
    </ViewWithFooter>
  );
};

export default UserProfile;

