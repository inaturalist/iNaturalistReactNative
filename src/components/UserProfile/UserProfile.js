// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchRelationships } from "api/relationships";
import { fetchRemoteUser } from "api/users";
import LoginSheet from "components/MyObservations/LoginSheet";
import {
  Body2,
  Heading1,
  Heading4,
  List2,
  OverviewCounts,
  ScrollViewWrapper,
  Subheading1,
  UserIcon,
  UserText
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import User from "realmModels/User.ts";
import { formatUserProfileDate } from "sharedHelpers/dateAndTime";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";

import FollowButtonContainer from "./FollowButtonContainer";
import UnfollowSheet from "./UnfollowSheet";

const UserProfile = ( ): Node => {
  const setExploreView = useStore( state => state.setExploreView );
  const navigation = useNavigation( );
  const currentUser = useCurrentUser( );
  const { params } = useRoute( );
  const { userId, login } = params;
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const [showUnfollowSheet, setShowUnfollowSheet] = useState( false );
  const { t } = useTranslation( );

  const fetchId = userId || login;
  const { data: remoteUser, isError, error } = useAuthenticatedQuery(
    ["fetchRemoteUser", fetchId],
    optsWithAuth => fetchRemoteUser( fetchId, {}, optsWithAuth ),
    {
      enabled: !!fetchId
    }
  );

  const user = remoteUser || null;

  const {
    data: relationships,
    refetch
  } = useAuthenticatedQuery(
    ["fetchRelationships"],
    optsWithAuth => fetchRelationships( {
      q: user?.login,
      fields: "following,friend_user,id",
      ttl: -1
    }, optsWithAuth ),
    {
      enabled: !!currentUser
    }
  );
  let relationshipResults = null;
  if ( relationships?.results && relationships.results.length > 0 ) {
    relationshipResults = relationships?.results
      .find( relationship => relationship.friendUser.id === userId );
  }

  // useEffect( ( ) => {
  //   const headerRight = ( ) => currentUser?.login === user?.login && (
  //     <INatIconButton
  //       icon="pencil"
  //       color={colors.darkGray}
  //       size={22}
  //       accessibilityLabel={t( "Edit" )}
  //     />
  //   );

  //   navigation.setOptions( { headerRight } );
  // }, [navigation, user, currentUser] );

  const onObservationPressed = useCallback(
    ( ) => {
      setExploreView( "observations" );
      navigation.navigate( "Explore", {
        user,
        worldwide: true
      } );
    },
    [navigation, user, setExploreView]
  );

  const onSpeciesPressed = useCallback(
    ( ) => {
      setExploreView( "species" );
      navigation.navigate( "Explore", {
        user,
        worldwide: true
      } );
    },
    [navigation, user, setExploreView]
  );

  if ( isError && error?.status === 404 ) {
    return (
      <View className="flex-1 items-center justify-center">
        <Heading4>{t( "ERROR" )}</Heading4>
        <List2>{t( "That-user-profile-doesnt-exist" )}</List2>
      </View>
    );
  }

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
        {( user?.roles || [] ).indexOf( "admin" ) >= 0 && (
          <Heading4 className="mt-1">
            {t( "INATURALIST-STAFF", { inaturalist: "INATURALIST" } )}
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
            <FollowButtonContainer
              refetchRelationship={refetch}
              relationship={relationshipResults}
              userId={userId}
              setShowLoginSheet={setShowLoginSheet}
              currentUser={currentUser}
              setShowUnfollowSheet={setShowUnfollowSheet}
            />
          )}
        </View>
        { user?.description && (
          <View className="mb-3">
            <Heading4 className="mb-2 mt-5">{t( "ABOUT" )}</Heading4>
            <UserText text={user?.description} />
          </View>
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
          relationship={relationshipResults}
          setShowUnfollowSheet={setShowUnfollowSheet}
          refetchRelationship={refetch}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default UserProfile;
