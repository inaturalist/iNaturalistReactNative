// @flow

import { useRoute } from "@react-navigation/native";
import { t } from "i18next";
import * as React from "react";
import { useWindowDimensions } from "react-native";
import HTML from "react-native-render-html";

import User from "../../models/User";
import useCurrentUser from "../../sharedHooks/useCurrentUser";
// import useNetworkSite from "./hooks/useNetworkSite";
import Button from "../SharedComponents/Buttons/Button";
import CustomHeader from "../SharedComponents/CustomHeader";
import UserIcon from "../SharedComponents/UserIcon";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import { Text, View } from "../styledComponents";
import updateRelationship from "./helpers/updateRelationship";
import useUser from "./hooks/useUser";
import UserProjects from "./UserProjects";

const UserProfile = ( ): React.Node => {
  const { params } = useRoute( );
  const { userId } = params;
  const currentUser = useCurrentUser( );
  const { user } = useUser( userId );
  const { width } = useWindowDimensions( );
  // const site = useNetworkSite( );

  const showCount = ( count, label ) => (
    <View className="w-1/4 border border-border">
      <Text className="self-center">{count}</Text>
      <Text className="self-center">{label}</Text>
    </View>
  );

  if ( !user ) { return null; }

  const showUserRole = user.roles.length > 0 && <Text>{`iNaturalist ${user.roles[0]}`}</Text>;

  const followUser = ( ) => updateRelationship( { id: userId, relationship: { following: true } } );

  return (
    <ViewWithFooter>
      <CustomHeader headerText={User.userHandle( user )} />
      <View className="flex-row m-3" testID={`UserProfile.${userId}`}>
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
        <View className="flex-row">
          <View className="w-1/2">
            <Button
              level="primary"
              text="Follow"
              onPress={followUser}
              testID="UserProfile.followButton"
            />
          </View>
          <View className="w-1/2">
            <Button
              level="primary"
              text="Messages"
              onPress={( ) => console.log( "open messages" )}
              testID="UserProfile.messagesButton"
            />
          </View>
        </View>
      )}
      <View className="flex-row">
        {showCount( user.observations_count, t( "Observations" ) )}
        {showCount( user.species_count, t( "Species" ) )}
        {showCount( user.identifications_count, t( "IDs" ) )}
        {showCount( user.journal_posts_count, t( "Journal-Posts" ) )}
      </View>
      <View className="mx-3 mt-5">
        <Text>{t( "BIO" )}</Text>
        { user && user.description && user.description.length > 0 && (
        <HTML
          contentWidth={width}
          source={{ html: user.description }}
        />
        ) }
        <Text className="mt-5">{t( "PROJECTS" )}</Text>
        <UserProjects userId={userId} />
      </View>
    </ViewWithFooter>
  );
};

export default UserProfile;
