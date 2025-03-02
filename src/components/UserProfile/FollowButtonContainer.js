// @flow

import { createRelationships, updateRelationships } from "api/relationships";
import type { Node } from "react";
import React, { useState } from "react";
import { Alert } from "react-native";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation, useTranslation } from "sharedHooks";

import FollowButton from "./FollowButton";

const logger = log.extend( "FollowButtonContainer" );

type Props = {
  currentUser: Object,
  refetchRelationship: Function,
  relationship: Object,
  setShowLoginSheet: Function,
  setShowUnfollowSheet: Function,
  userId: number,
  setShowUserNeedToConfirm: Function,
  isUserConfirmed: boolean
};

const FollowButtonContainer = ( {
  currentUser,
  refetchRelationship,
  relationship,
  setShowLoginSheet,
  setShowUnfollowSheet,
  userId,
  setShowUserNeedToConfirm,
  isUserConfirmed
}: Props ): Node => {
  const [loading, setLoading] = useState( false );
  const { t } = useTranslation( );

  const following = relationship?.following;

  const createRelationshipsMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createRelationships( params, optsWithAuth )
  );

  const updateRelationshipsMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateRelationships( params, optsWithAuth )
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
      logger.error( error );
      Alert.alert( t( "Something-went-wrong" ) );
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
      logger.error( error );
      Alert.alert( t( "Something-went-wrong" ) );
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
    if ( !isUserConfirmed ) {
      setShowUserNeedToConfirm( true );
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
    if ( !isUserConfirmed ) {
      setShowUserNeedToConfirm( true );
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
