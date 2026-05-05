import { useNavigation, useRoute } from "@react-navigation/native";
import type { ErrorWithResponse, INatApiError } from "api/error";
import { fetchRelationships } from "api/relationships";
import type { ApiRelationship, ApiUser } from "api/types";
import { fetchRemoteUser } from "api/users";
import LoginSheet from "components/MyObservations/LoginSheet";
import {
  Body2,
  Button,
  Heading1,
  Heading4,
  List2,
  OverviewCounts,
  ScrollViewWrapper,
  Subheading1,
  UserIcon,
  UserText,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, { useState } from "react";
import User from "realmModels/User";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useTranslation,
} from "sharedHooks";
import useStore from "stores/useStore";

import FollowButtonContainer from "./FollowButtonContainer";
import UnfollowSheet from "./UnfollowSheet";

const UserProfile = ( ) => {
  const setExploreView = useStore( state => state.setExploreView );
  const navigation = useNavigation <TabStackScreenProps<"UserProfile">["navigation"]>( );
  const currentUser = useCurrentUser( );
  const { params } = useRoute<TabStackScreenProps<"UserProfile">["route"]>();
  const { userId, login } = params;
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const [showUnfollowSheet, setShowUnfollowSheet] = useState( false );
  const { t, i18n } = useTranslation( );

  const fetchId = userId || login;
  const { data: remoteUser, isError, error }: {
    data: ApiUser | null;
    isError: boolean;
    error: INatApiError | ErrorWithResponse;
  } = useAuthenticatedQuery(
    ["fetchRemoteUser", fetchId],
    optsWithAuth => fetchRemoteUser( fetchId, {}, optsWithAuth ),
    {
      enabled: !!fetchId,
    },
  );

  const user = remoteUser || null;

  const relationshipsQueryKey = ["fetchRelationships", user?.login];

  const { data: relationships, refetch }: {
    data: ApiRelationship[] | null;
    refetch: ( ) => void;
  } = useAuthenticatedQuery(
    relationshipsQueryKey,
    optsWithAuth => fetchRelationships( {
      q: user?.login,
      fields: "following,friend_user,id",
      ttl: -1,
      per_page: 500,
    }, optsWithAuth ),
    {
      enabled: !!currentUser,
    },
  );

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

  let hasRelationshipWithCurrentUser;
  if ( relationships?.length > 0 ) {
    hasRelationshipWithCurrentUser = relationships.find(
      relationship => relationship.friendUser.id === userId,
    );
  }

  const onObservationPressed = ( ) => {
    setExploreView( "observations" );
    navigation.navigate( "Explore", {
      user,
      worldwide: true,
    } );
  };

  const onSpeciesPressed = ( ) => {
    setExploreView( "species" );
    navigation.navigate( "Explore", {
      user,
      worldwide: true,
    } );
  };

  return (
    <ScrollViewWrapper testID="UserProfile">
      <View
        className="items-center"
        testID={`UserProfile.${userId}`}
      >
        <UserIcon uri={User.uri( user )} large />
        <Heading1 className="mt-3" selectable>{user?.login}</Heading1>
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
        {currentUser?.login !== user?.login && (
          <View className="mt-[30px]">
            <FollowButtonContainer
              refetchRelationship={refetch}
              relationship={hasRelationshipWithCurrentUser}
              userId={userId}
              setShowLoginSheet={setShowLoginSheet}
              currentUser={currentUser}
              setShowUnfollowSheet={setShowUnfollowSheet}
            />
          </View>
        )}
        { user?.description && (
          <View className="mt-[30px]">
            <Heading4 className="mb-2">{t( "ABOUT" )}</Heading4>
            <UserText text={user?.description} />
          </View>
        ) }
        <View className="mt-8 mb-8">
          <Heading4 className="mb-[11px]">
            {t( "PROJECTS" )}
          </Heading4>
          <Button
            text={t( "VIEW-PROJECTS" )}
            onPress={( ) => navigation.navigate( "ProjectList", {
              userId,
              userLogin: user.login,
            } )}
          />
        </View>
        <View className="mb-8">
          <Heading4 className="mb-[11px]">
            {t( "PEOPLE--title" )}
          </Heading4>
          <Button
            text={t( "VIEW-FOLLOWERS" )}
            onPress={( ) => navigation.navigate( "FollowersList", { user } )}
          />
          <Button
            className="mt-6"
            text={t( "VIEW-FOLLOWING" )}
            onPress={( ) => navigation.navigate( "FollowingList", { user } )}
          />
        </View>
        <Body2 className="mb-5">
          {t( "Joined-date", { date: formatLongDate( user.created_at, i18n ) } )}
        </Body2>
        <Body2 className="mb-5">
          {t( "Last-Active-date", { date: formatLongDate( user.updated_at, i18n ) } )}
        </Body2>
        {user.site && (
          <Body2 className="mb-5">
            {t( "Affiliation", { site: user.site.name } )}
          </Body2>
        )}
        {/* TODO fix this when we know whether the user is a donor and prefers to show it */}
        {/* {user.monthly_supporter && (
          <Body2 className="mb-5">
            {t( "Monthly-Donor" )}
          </Body2>
        )} */}
      </View>
      {showLoginSheet && <LoginSheet setShowLoginSheet={setShowLoginSheet} />}
      {showUnfollowSheet && (
        <UnfollowSheet
          relationship={hasRelationshipWithCurrentUser}
          setShowUnfollowSheet={setShowUnfollowSheet}
          refetchRelationship={refetch}
        />
      )}
    </ScrollViewWrapper>
  );
};

export default UserProfile;
