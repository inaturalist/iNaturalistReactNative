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
};

const FollowButtonContainer = ( {
  currentUser,
  refetchRelationship,
  relationship,
  setShowLoginSheet,
  setShowUnfollowSheet,
  userId,
}: Props ): Node => {
  const [loading, setLoading] = useState( false );
  const { t } = useTranslation( );

  const following = relationship?.following;

  const { mutate: createRelationshipsMutate } = useAuthenticatedMutation(
    ( params, optsWithAuth ) => createRelationships( params, optsWithAuth ),
    {
      onSuccess: () => {
        refetchRelationship();
        setLoading( false );
      },
      onError: error => {
        setLoading( false );
        logger.error( error );
        Alert.alert( t( "Something-went-wrong" ) );
      },
    },
  );

  const { mutate: updateRelationshipsMutate } = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateRelationships( params, optsWithAuth ),
    {
      onSuccess: () => {
        refetchRelationship();
        setLoading( false );
      },
      onError: error => {
        setLoading( false );
        logger.error( error );
        Alert.alert( t( "Something-went-wrong" ) );
      },
    },
  );

  const follow = () => {
    if ( relationship ) {
      updateRelationshipsMutate( {
        id: relationship?.id,
        relationship: {
          following: true,
        },
      } );
    } else {
      createRelationshipsMutate( {
        relationship: {
          friend_id: userId,
          following: true,
        },
      } );
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
