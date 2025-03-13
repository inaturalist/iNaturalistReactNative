import { fetchUserMe, updateUsers } from "api/users";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useState } from "react";
import QueueItem from "realmModels/QueueItem.ts";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedMutation
} from "sharedHooks";

const logger = log.extend( "useWorkQueue" );

const { useRealm } = RealmContext;

const useWorkQueue = ( ) => {
  const realm = useRealm( );
  const [dequeuedItemId, setDequeuedItemId] = useState( null );

  // we probably don't want this user mutation logic in the useWorkQueue in the long run
  const updateUserMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => updateUsers( params, optsWithAuth ),
    {
      onSuccess: async ( ) => {
        QueueItem.deleteDequeuedItem( realm, dequeuedItemId );
        setDequeuedItemId( null );
        // note: we probably want to request that the web team changes
        // the API to send back a user object with all the right preferences
        // someday, but here we're fetching instead
        // to make sure the correct user preferences were set and will be fetched
        // on subsequent calls to fetchUserMe

        const apiToken = await getJWT( );
        const options = {
          api_token: apiToken
        };
        const updatedUser = await fetchUserMe( { }, options );
        safeRealmWrite( realm, ( ) => {
          realm.create( "User", updatedUser, "modified" );
        }, "modifying user via remote fetch in updateUserMutation" );
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
      // and hopefully for the TaxonNamesSetting also?
      if ( collection.length > 0 && !dequeuedItemId ) {
        const dequeuedItem = QueueItem.dequeue( realm );
        if ( dequeuedItem ) {
          const { id, payload: dequeuedPayload, type: dequeuedType } = dequeuedItem;
          if ( dequeuedType === "locale-change" || dequeuedType === "taxon-names-change" ) {
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
