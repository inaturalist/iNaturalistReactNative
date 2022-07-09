// @flow

import * as React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { useRoute } from "@react-navigation/native";
import HTML from "react-native-render-html";
import { t } from "i18next";

import { textStyles, viewStyles } from "../../styles/userProfile/userProfile";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useUser from "./hooks/useUser";
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
          <Text>{`${t( "Joined-colon" )} ${user.created_at}`}</Text>
          <Text>{`${t( "Last-Active-colon" )} ${user.updated_at}`}</Text>
          <Text>{`${t( "Affiliation-colon" )} ${user.site_id}`}</Text>
        </View>
      </View>
      {!currentUser && (
        <View style={viewStyles.buttonRow}>
          <View style={viewStyles.button}>
            <RoundGreenButton
              buttonText="Follow"
              handlePress={followUser}
              testID="UserProfile.followButton"
            />
          </View>
          <View style={viewStyles.button}>
            <RoundGreenButton
              buttonText="Messages"
              handlePress={( ) => console.log( "open messages" )}
              testID="UserProfile.messagesButton"
            />
          </View>
        </View>
      )}
      <View style={viewStyles.countRow}>
        {showCount( user.observations_count, t( "Observations" ) )}
        {showCount( user.species_count, t( "Species" ) )}
        {showCount( user.identifications_count, t( "IDs" ) )}
        {showCount( user.journal_posts_count, t( "Journal-Posts" ) )}
      </View>
      <Text>{t( "BIO" )}</Text>
      { user && user.description && user.description.length > 0 && (
        <HTML
          contentWidth={width}
          source={{ html: user.description }}
        />
      ) }
      <Text>{t( "PROJECTS" )}</Text>
      <UserProjects userId={userId} />
    </ViewWithFooter>
  );
};

export default UserProfile;
