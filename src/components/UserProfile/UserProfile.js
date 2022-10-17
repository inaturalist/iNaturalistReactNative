// @flow

import { useRoute } from "@react-navigation/native";
import { fetchRemoteUser } from "api/users";
import Button from "components/SharedComponents/Buttons/Button";
import CustomHeader from "components/SharedComponents/CustomHeader";
import UserIcon from "components/SharedComponents/UserIcon";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { t } from "i18next";
import * as React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import HTML from "react-native-render-html";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { textStyles, viewStyles } from "styles/userProfile/userProfile";

import User from "../../models/User";
import updateRelationship from "./helpers/updateRelationship";
import UserProjects from "./UserProjects";

const UserProfile = ( ): React.Node => {
  const { params } = useRoute( );
  const { userId } = params;
  const { width } = useWindowDimensions( );

  const {
    data: remoteUser
  } = useAuthenticatedQuery(
    ["fetchRemoteUser", userId],
    optsWithAuth => fetchRemoteUser( userId, { }, optsWithAuth )
  );

  const user = remoteUser[0];

  const showCount = ( count, label ) => (
    <View style={viewStyles.countBox}>
      <Text style={textStyles.text}>{count}</Text>
      <Text style={textStyles.text}>{label}</Text>
    </View>
  );

  if ( !user ) { return null; }

  const showUserRole = user?.roles?.length > 0 && <Text>{`iNaturalist ${user.roles[0]}`}</Text>;

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
      {/* TODO: hide follow and messages for current user */}
      <View style={viewStyles.buttonRow}>
        <View style={viewStyles.button}>
          <Button
            level="primary"
            text="Follow"
            onPress={followUser}
            testID="UserProfile.followButton"
          />
        </View>
        <View style={viewStyles.button}>
          <Button
            level="primary"
            text="Messages"
            onPress={( ) => console.log( "open messages" )}
            testID="UserProfile.messagesButton"
          />
        </View>
      </View>
      <View style={viewStyles.countRow}>
        {showCount( user.observations_count, t( "Observations" ) )}
        {showCount( user.species_count, t( "Species" ) )}
        {showCount( user.identifications_count, t( "IDs" ) )}
        {showCount( user.journal_posts_count, t( "Journal-Posts" ) )}
      </View>
      <Text>{t( "BIO" )}</Text>
      { user?.description?.length > 0 && (
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
