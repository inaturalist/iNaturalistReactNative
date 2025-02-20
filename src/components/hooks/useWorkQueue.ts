import { updateUsers } from "api/users";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useState } from "react";
import QueueItem from "realmModels/QueueItem.ts";
import { log } from "sharedHelpers/logger";
import {
  useAuthenticatedMutation
} from "sharedHooks";

const logger = log.extend( "useWorkQueue" );

const { useRealm } = RealmContext;

const useWorkQueue = ( ) => {
  const realm = useRealm( );
  const [dequeuedItemId, setDequeuedItemId] = useState( null );

  const updateUserMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateUsers( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        QueueItem.deleteDequeuedItem( realm, dequeuedItemId );
        setDequeuedItemId( null );
      },
      onError: userUpdateError => {
        logger.error( "user update failed: ", userUpdateError );
        QueueItem.markAsFailed( realm, dequeuedItemId );
        setDequeuedItemId( null );
      }
    }
  );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      return;
    }
    const queuedItems = realm.objects( "QueueItem" );
    queuedItems.addListener( ( collection, _changes ) => {
      // TODO: this is a naive implementation that only dequeues one item at a time
      // which should be all we need for the LanguageSetting use case
      if ( collection.length > 0 && !dequeuedItemId ) {
        const dequeuedItem = QueueItem.dequeue( realm );
        if ( dequeuedItem ) {
          const { id, payload: dequeuedPayload, type: dequeuedType } = dequeuedItem;
          if ( dequeuedType === "locale-change" ) {
            setDequeuedItemId( id );
            updateUserMutation.mutate( dequeuedPayload );
          }
        }
      }
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      queuedItems?.removeAllListeners( );
    };
  }, [realm, updateUserMutation, dequeuedItemId] );
};

export default useWorkQueue;
