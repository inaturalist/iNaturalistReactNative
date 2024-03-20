// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchRelationships } from "api/relationships";
import { fetchRemoteUser } from "api/users";
import LoginSheet from "components/MyObservations/LoginSheet";
import {
  Body2,
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
import React, { useCallback, useEffect, useState } from "react";
import User from "realmModels/User";
import { formatUserProfileDate } from "sharedHelpers/dateAndTime";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";
import colors from "styles/tailwindColors";

import FollowButton from "./FollowButton";
import UnfollowSheet from "./UnfollowSheet";

const UserProfile = ( ): Node => {
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const { params } = useRoute( );
  const { userId } = params;
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const [showUnfollowSheet, setShowUnfollowSheet] = useState( false );

  const { data: remoteUser } = useAuthenticatedQuery(
    ["fetchRemoteUser", userId],
    optsWithAuth => fetchRemoteUser( userId, {}, optsWithAuth )
  );

  const user = remoteUser || null;

  const {
    data,
    refetch
  } = useAuthenticatedQuery(
    ["fetchRelationships"],
    optsWithAuth => fetchRelationships( {
      q: user?.login,
      fields: "following,friend_user",
      ttl: -1
    }, optsWithAuth )
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
        <View className="mt-8 mb-4">
          {currentUser?.login !== user?.login && (
            <FollowButton
              refetchRelationship={refetch}
              data={data}
              user={user}
              userId={userId}
              setShowLoginSheet={setShowLoginSheet}
              currentUser={currentUser}
              setShowUnfollowSheet={setShowUnfollowSheet}
            />
          )}
        </View>
        { user?.description && (
          <>
            <Heading4 className="mb-2 mt-5">{t( "ABOUT" )}</Heading4>
            <UserText text={user?.description} />
          </>
        ) }
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
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
      {showUnfollowSheet && (
        <UnfollowSheet
          userId={userId}
          setShowUnfollowSheet={setShowUnfollowSheet}
          refetchRelationship={refetch}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default UserProfile;
