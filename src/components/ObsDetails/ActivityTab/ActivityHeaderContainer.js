// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteComments, updateComment } from "api/comments";
import { updateIdentification } from "api/identifications";
import { isCurrentUser } from "components/LoginSignUp/AuthenticationService";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

import ActivityHeader from "./ActivityHeader";

type Props = {
  item: Object,
  refetchRemoteObservation?: Function,
  classNameMargin?: string,
  idWithdrawn: boolean,
  isOnline: boolean
}

const ActivityHeaderContainer = ( {
  item, refetchRemoteObservation, classNameMargin,
  idWithdrawn, isOnline
}:Props ): Node => {
  const [currentUser, setCurrentUser] = useState( false );
  const [flagged, setFlagged] = useState( false );
  const [loading, setLoading] = useState( false );
  // const realm = useRealm( );
  const queryClient = useQueryClient( );
  const { user } = item;

  useEffect( ( ) => {
    const isActiveUserTheCurrentUser = async ( ) => {
      const current = await isCurrentUser( user?.login );
      setCurrentUser( current );
    };
    isActiveUserTheCurrentUser( );

    if ( item.flags?.length > 0 ) {
      setFlagged( true );
    }
  }, [user, item] );

  // const onItemFlagged = () => {
  //   if ( refetchRemoteObservation ) {
  //     setFlagged( true );
  //     refetchRemoteObservation();
  //   }
  // };

  const deleteCommentMutation = useAuthenticatedMutation(
    ( uuid, optsWithAuth ) => deleteComments( uuid, optsWithAuth ),
    {
      onSuccess: ( ) => {
        setLoading( false );
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      }
    }
  );

  const deleteUserComment = () => {
    setLoading( true );
    // Comment.deleteComment( item.uuid, realm );
    // then delete remotely
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
    ( uuid, optsWithAuth ) => updateIdentification( uuid, optsWithAuth ),
    {
      onSuccess: () => {
        setLoading( false );
        queryClient.invalidateQueries( ["fetchRemoteObservation", item.uuid] );
        if ( refetchRemoteObservation ) {
          refetchRemoteObservation( );
        }
      }
    }
  );

  const withdrawOrRestoreIdentification = withdrawOrRestore => {
    const updateIdentificationParams = {
      id: item.uuid,
      identification: {
        body: "",
        current: withdrawOrRestore
      }
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
      withdrawOrRestoreIdentification={withdrawOrRestoreIdentification}
      isOnline={isOnline}
    />
  );
};

export default ActivityHeaderContainer;
