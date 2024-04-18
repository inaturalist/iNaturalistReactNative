// @flow

import { createRelationships, updateRelationships } from "api/relationships";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuthenticatedMutation } from "sharedHooks";

import FollowButton from "./FollowButton";

type Props = {
    userId: number,
    relationship: any,
    refetchRelationship: any,
    setShowLoginSheet: any,
    setShowUnfollowSheet: any,
    currentUser: any
  };

const FollowButtonContainer = ( {
  userId, setShowLoginSheet, setShowUnfollowSheet,
  currentUser, relationship, refetchRelationship
}: Props ): Node => {
  const [loading, setLoading] = useState( false );
  const [following, setFollowing] = useState( false );

  useEffect( ( ) => {
    if ( relationship?.following === true ) {
      setFollowing( true );
      return;
    }
    setFollowing( false );
  }, [relationship, refetchRelationship] );

  const createRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => createRelationships( id, optsWithAuth )
  );

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( id, optsWithAuth ) => updateRelationships( id, optsWithAuth )
  );

  const createRelationshipsMutate = ( ) => createRelationshipsMutation.mutate( {
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

  const updateRelationshipsMutate = ( ) => updateRelationshipsMutation.mutate( {
    id: relationship.id,
    relationship: {
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

  const follow = () => {
    if ( relationship ) {
      updateRelationshipsMutate();
    } else {
      createRelationshipsMutate();
    }
  };

  const followUser = () => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    setLoading( true );
    follow();
  };

  const unfollowUser = ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
      return;
    }
    setShowUnfollowSheet( true );
  };

  return (
    <FollowButton
      loading={loading}
      following={following}
      follow={followUser}
      unfollow={unfollowUser}
    />
  );
};

export default FollowButtonContainer;
