// @flow

import { createRelationships } from "api/relationships";
import {
  Button
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuthenticatedMutation } from "sharedHooks";

type Props = {
    user: Object,
    userId: number,
    data: Object,
    refetchRelationship: Function,
    setShowLoginSheet: Function,
    setShowUnfollowSheet: Function,
    currentUser: Object
  };

const FollowButton = ( {
  userId, setShowLoginSheet, setShowUnfollowSheet, currentUser, user, data, refetchRelationship
}: Props ): Node => {
  const [loading, setLoading] = useState( false );
  const [following, setFollowing] = useState( false );

  const relationshipResults = data?.results
    .find( relationship => relationship.friendUser.id === userId );

  useEffect( ( ) => {
    if ( relationshipResults?.following === true ) {
      setFollowing( true );
      return;
    }
    setFollowing( false );
  }, [data, refetchRelationship, relationshipResults] );

  const createRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => createRelationships( id, optsWithAuth )
  );

  const followUser = ( ) => createRelationshipsMutation.mutate( {
    relationship: {
      friend_id: userId,
      following: true
    }
  }, {
    onSuccess: () => {
      refetchRelationship();
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
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    } if ( currentUser?.login !== user?.login ) {
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
