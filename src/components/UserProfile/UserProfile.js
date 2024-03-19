// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { updateRelationships } from "api/relationships";
import { fetchRemoteUser } from "api/users";
import {
  Body2,
  Button,
  Heading1,
  Heading4,
  INatIconButton,
  OverviewCounts,
  ScrollViewWrapper,
  Subheading1,
  UserIcon,
  UserText
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import User from "realmModels/User";
import { formatUserProfileDate } from "sharedHelpers/dateAndTime";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";
import colors from "styles/tailwindColors";

const UserProfile = ( ): Node => {
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const { params } = useRoute( );
  const { userId } = params;

  const { data: remoteUser } = useAuthenticatedQuery(
    ["fetchRemoteUser", userId],
    optsWithAuth => fetchRemoteUser( userId, {}, optsWithAuth )
  );

  const user = remoteUser || null;

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth )
  );

  useEffect( ( ) => {
    const headerRight = ( ) => currentUser?.login === user?.login && (
      <INatIconButton
        icon="pencil"
        color={colors.darkGray}
        size={22}
        accessibilityLabel={t( "Edit" )}
      />
    );

    navigation.setOptions( { headerRight } );
  }, [navigation, user, currentUser] );

  const onObservationPressed = useCallback(
    ( ) => navigation.navigate( "Explore", { user, worldwide: true } ),
    [navigation, user]
  );

  const onSpeciesPressed = useCallback(
    ( ) => navigation.navigate( "Explore", { user, worldwide: true, viewSpecies: true } ),
    [navigation, user]
  );

  if ( !user ) {
    return null;
  }

  const followUser = ( ) => updateRelationshipsMutation.mutate( {
    id: userId,
    relationship: { following: true }
  } );

  return (
    <ScrollViewWrapper testID="UserProfile">
      <View
        className="items-center"
        testID={`UserProfile.${userId}`}
      >
        <UserIcon uri={User.uri( user )} large />
        <Heading1 className="mt-3">{User.userHandle( user )}</Heading1>
        <Subheading1 className="mt-1">{user.name}</Subheading1>
        {user?.roles?.length > 0 && (
          <Heading4 className="mt-1">
            {t( "INATURALIST", { role: user.roles[0] } )}
          </Heading4>
        )}
      </View>
      <OverviewCounts
        counts={user}
        onObservationPressed={onObservationPressed}
        onSpeciesPressed={onSpeciesPressed}
      />
      <View className="mx-3">
        {currentUser?.login !== user?.login && (
          <View className="flex-row justify-evenly mt-8 mb-4">
            <Button
              level="primary"
              className="grow"
              text={t( "FOLLOW" )}
              onPress={followUser}
              testID="UserProfile.followButton"
            />
            <Button
              className="grow ml-3"
              level="primary"
              text={t( "MESSAGE" )}
              onPress={( ) => navigation.navigate( "Messages" )}
              testID="UserProfile.messagesButton"
            />
          </View>
        )}
        { user?.description && (
          <>
            <Heading4 className="mb-2 mt-5">{t( "ABOUT" )}</Heading4>
            <UserText text={user?.description} />
          </>
        ) }
        <Heading4 className="mb-2 mt-5">{t( "PROJECTS" )}</Heading4>
        <Button
          className="mb-6"
          text={t( "VIEW-PROJECTS" )}
          onPress={( ) => navigation.navigate( "Projects" )}
        />
        <Heading4 className="mb-2">{t( "PEOPLE" )}</Heading4>
        <Button
          className="mb-6"
          text={t( "VIEW-FOLLOWERS" )}
        />
        <Button
          className="mb-6"
          text={t( "VIEW-FOLLOWING" )}
        />
        <Heading4 className="mb-2">{t( "JOURNAL-POSTS" )}</Heading4>
        <Button
          className="mb-6"
          text={t( "VIEW-JOURNAL-POSTS" )}
        />
        <Body2 className="mb-5">
          {t( "Joined-date", { date: formatUserProfileDate( user.created_at, t ) } )}
        </Body2>
        <Body2 className="mb-5">
          {t( "Last-Active-date", { date: formatUserProfileDate( user.updated_at, t ) } )}
        </Body2>
        {user.site && (
          <Body2 className="mb-5">
            {t( "Affiliation", { site: user.site.name } )}
          </Body2>
        )}
        {user.monthly_supporter && (
          <Body2 className="mb-5">
            {t( "Monthly-Donor" )}
          </Body2>
        )}
      </View>
    </ScrollViewWrapper>
  );
};

export default UserProfile;
