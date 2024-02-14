// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteComments, updateComment } from "api/comments";
import { updateIdentification as apiUpdateIdentification } from "api/identifications";
import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

import ActivityHeader from "./ActivityHeader";

type Props = {
  classNameMargin?: string,
  idWithdrawn?: boolean,
  isOnline?: boolean,
  item: Object,
  refetchRemoteObservation?: Function
}

const ActivityHeaderContainer = ( {
  classNameMargin,
  idWithdrawn,
  isOnline,
  item,
  refetchRemoteObservation
}:Props ): Node => {
  const [currentUser, setCurrentUser] = useState( false );
  const [flagged, setFlagged] = useState( false );
  const [loading, setLoading] = useState( false );
  const queryClient = useQueryClient( );
  const { user } = item;

  const numFlags = item.flags?.length || 0;

  useEffect( ( ) => {
    const isActiveUserTheCurrentUser = async ( ) => {
      const current = await isCurrentUser( user?.login );
      setCurrentUser( current );
    };
    isActiveUserTheCurrentUser( );

    if ( numFlags > 0 ) {
      setFlagged( true );
    }
  }, [user, numFlags] );

  const deleteCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => deleteComments( uuid, optsWithAuth ),
    {
      onSuccess: ( ) => {
        setLoading( false );
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      },
      onError: () => {
        setLoading( false );
      }
    }
  );

  const deleteUserComment = () => {
    setLoading( true );
    deleteCommentMutation.mutate( item.uuid );
  };

  const updateCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => updateComment( uuid, optsWithAuth ),
    {
      onSuccess: () => {
        setLoading( false );
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      },
      onError: () => {
        setLoading( false );
      }
    }
  );

  const updateCommentBody = comment => {
    const updateCommentParams = {
      id: item.uuid,
      comment: {
        body: comment
      }
    };
    setLoading( true );
    updateCommentMutation.mutate( updateCommentParams );
  };

  const updateIdentificationMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => apiUpdateIdentification( uuid, optsWithAuth ),
    {
      onSuccess: () => {
        setLoading( false );
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      },
      onError: () => {
        setLoading( false );
      }
    }
  );

  const updateIdentification = identification => {
    const updateIdentificationParams = {
      id: item.uuid,
      identification
    };
    setLoading( true );
    updateIdentificationMutation.mutate( updateIdentificationParams );
  };

  return (
    <ActivityHeader
      loading={loading}
      item={item}
      currentUser={currentUser}
      idWithdrawn={idWithdrawn}
      classNameMargin={classNameMargin}
      flagged={flagged}
      updateCommentBody={updateCommentBody}
      deleteComment={deleteUserComment}
      updateIdentification={updateIdentification}
      isOnline={isOnline}
    />
  );
};

export default ActivityHeaderContainer;
