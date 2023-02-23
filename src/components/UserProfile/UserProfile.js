// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { updateRelationships } from "api/relationships";
import { fetchRemoteUser } from "api/users";
import { Button, UserIcon } from "components/SharedComponents";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { Button as RNPaperButton } from "react-native-paper";
import HTML from "react-native-render-html";
import User from "realmModels/User";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import colors from "styles/tailwindColors";

import UserProjects from "./UserProjects";

const UserProfile = ( ): React.Node => {
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const { params } = useRoute( );
  const { userId } = params;
  const { width } = useWindowDimensions( );

  const {
    data: remoteUser
  } = useAuthenticatedQuery(
    ["fetchRemoteUser", userId],
    optsWithAuth => fetchRemoteUser( userId, { }, optsWithAuth )
  );

  const user = remoteUser || null;

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth )
  );

  const showCount = ( count, label ) => (
    <View className="w-1/4 border border-lightGray">
      <Text className="self-center">{count}</Text>
      <Text className="self-center">{label}</Text>
    </View>
  );

  useEffect( ( ) => {
    const headerTitle = ( ) => <Text className="text-xl pb-2">{User.userHandle( user )}</Text>;
    const headerRight = ( ) => currentUser?.login === user?.login
      && <RNPaperButton icon="pencil" textColor={colors.lightGray} />;

    navigation.setOptions( {
      headerTitle,
      headerRight
    } );
  }, [navigation, user, currentUser] );

  if ( !user ) { return null; }

  const showUserRole = user?.roles?.length > 0 && <Text>{`iNaturalist ${user.roles[0]}`}</Text>;

  const followUser = ( ) => updateRelationshipsMutation.mutate( {
    id: userId,
    relationship: { following: true }
  } );

  return (
    <ViewWithFooter testID="UserProfile">
      <View className="flex-row justify-evenly items-center m-3" testID={`UserProfile.${userId}`}>
        <UserIcon uri={User.uri( user )} />
        <View>
          <Text>{user.name}</Text>
          {showUserRole}
          <Text>{`${t( "Joined-colon" )} ${user.created_at}`}</Text>
          <Text>{`${t( "Last-Active-colon" )} ${user.updated_at}`}</Text>
          <Text>{`${t( "Affiliation-colon" )} ${user.site_id}`}</Text>
        </View>
      </View>
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
      {!currentUser && (
        <View className="flex-row">
          <View className="w-1/2">
            <Button
              level="focus"
              text={t( "Follow" )}
              onPress={followUser}
              testID="UserProfile.followButton"
            />
          </View>
          <View className="w-1/2">
            <Button
              level="focus"
              text={t( "Messages" )}
              onPress={( ) => navigation.navigate( "Messages" )}
              testID="UserProfile.messagesButton"
            />
          </View>
        </View>
      )}
    </ViewWithFooter>
  );
};

export default UserProfile;
