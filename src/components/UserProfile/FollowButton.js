// @flow

import { fetchRelationships, updateRelationships } from "api/relationships";
import {
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuthenticatedMutation, useAuthenticatedQuery } from "sharedHooks";

type Props = {
    user: Object,
    userId: number,
    setShowLoginSheet: Function,
    setShowUnfollowSheet: Function,
    currentUser: Object
  };

const FollowButton = ( {
  userId, setShowLoginSheet, setShowUnfollowSheet, currentUser, user
}: Props ): Node => {
  const [loading, setLoading] = useState( false );
  const [following, setFollowing] = useState( false );

  const {
    data,
    refetch
  } = useAuthenticatedQuery(
    ["fetchRelationships"],
    optsWithAuth => fetchRelationships( {
      q: user.login,
      fields: "following",
      ttl: -1
    }, optsWithAuth )
  );

  const relationshipResults = data?.results[0];

  useEffect( ( ) => {
    if ( relationshipResults?.following === true ) {
      setFollowing( true );
      return;
    }
    setFollowing( false );
  }, [relationshipResults] );

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth )
  );

  const followUser = ( ) => updateRelationshipsMutation.mutate( {
    id: userId,
    relationship: { following: true }
  }, {
    onSuccess: () => {
    //   console.log( "follow or unfollow", data );
      refetch();
      setLoading( false );
    },
    onError: error => {
      setLoading( false );
      Alert.alert( "Error Following/Unfollowing", error );
    }
  } );

  const unfollowUser = ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    setShowUnfollowSheet( true );
  };

  const handlePress = () => {
    console.log( "handlepress" );
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    } if ( currentUser?.login !== user?.login ) {
      console.log( "loading..." );
      setLoading( true );
      followUser();
    }
  };

  return (
    <View className="flex">
      {currentUser?.login !== user?.login && !following
        ? (
          <Button
            level="primary"
            className="grow"
            loading={loading}
            text={t( "FOLLOW" )}
            onPress={handlePress}
            testID="UserProfile.followButton"
          />
        )
        : (
          <Button
            level="primary"
            className="grow"
            text={t( "UNFOLLOW" )}
            onPress={unfollowUser}
            testID="UserProfile.followButton"
          />
        )}
    </View>
  );
};

export default FollowButton;
