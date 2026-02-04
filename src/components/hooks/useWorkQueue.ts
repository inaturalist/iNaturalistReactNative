import { fetchUserMe, updateUsers } from "api/users";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import QueueItem from "realmModels/QueueItem";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedMutation,
} from "sharedHooks";

const logger = log.extend( "useWorkQueue" );

const { useRealm } = RealmContext;

const useWorkQueue = ( ) => {
  const realm = useRealm( );
  const [dequeuedItemId, setDequeuedItemId] = useState( null );

  // we probably don't want this user mutation logic in the useWorkQueue in the long run
  const { mutate: updateUserMutate } = useAuthenticatedMutation(
    ( params, optsWithAuth ) => {
      logger.info( `Sending API request to update user with params: ${JSON.stringify( params )}` );
      return updateUsers( params, optsWithAuth );
    },
    {
      onSuccess: async ( ) => {
        // logger.info( `API update successful for item ID: ${dequeuedItemId}` );
        QueueItem.deleteDequeuedItem( realm, dequeuedItemId );
        setDequeuedItemId( null );
        // note: we probably want to request that the web team changes
        // the API to send back a user object with all the right preferences
        // someday, but here we're fetching instead
        // to make sure the correct user preferences were set and will be fetched
        // on subsequent calls to fetchUserMe

        const apiToken = await getJWT( );
        const options = {
          api_token: apiToken,
        };
        const updatedUser = await fetchUserMe( { }, options );
        // logger.info( `Received updated user data from API: ${JSON.stringify( updatedUser )}` );

        safeRealmWrite( realm, ( ) => {
          // const existingUser = realm.objectForPrimaryKey( "User", updatedUser.id );
          // if ( existingUser ) {
          // eslint-disable-next-line max-len
          //   logger.info( `Existing user in Realm: prefers_common_names=${existingUser.prefers_common_names}, prefers_scientific_name_first=${existingUser.prefers_scientific_name_first}` );
          // }
          realm.create( "User", updatedUser, "modified" );
          // const updatedRealmUser = realm.objectForPrimaryKey( "User", updatedUser.id );
          // eslint-disable-next-line max-len
          // logger.info( `Updated user in Realm: prefers_common_names=${updatedRealmUser.prefers_common_names}, prefers_scientific_name_first=${updatedRealmUser.prefers_scientific_name_first}` );
        }, "modifying user via remote fetch in updateUserMutate" );
      },
      onError: userUpdateError => {
        logger.error( `User update failed for item ID: ${dequeuedItemId}`, userUpdateError );
        // logger.info( "Marking queue item as failed" );
        QueueItem.markAsFailed( realm, dequeuedItemId );
        setDequeuedItemId( null );
      },
    },
  );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      // Satisfy the useEffect return type by returning a destructor function.
      return () => {};
    }
    const queuedItems = realm.objects( "QueueItem" );
    // logger.info( `Initial queue size: ${queuedItems?.length}` );
    queuedItems.addListener( ( collection, _changes ) => {
      // eslint-disable-next-line max-len
      // logger.info( `Queue listener triggered. Queue size: ${collection?.length}, dequeued item ID: ${dequeuedItemId}` );

      // if ( _changes ) {
      // eslint-disable-next-line max-len
      //   logger.info( `Queue changes - insertions: ${_changes.insertions?.length}, modifications: ${_changes.modifications?.length}, deletions: ${_changes.deletions?.length}` );
      // }

      // TODO: this is a naive implementation that only dequeues one item at a time
      // which should be all we need for the LanguageSetting use case
      // and hopefully for the TaxonNamesSetting also?
      if ( collection.length > 0 && !dequeuedItemId ) {
        // logger.info( "Attempting to dequeue an item" );
        const dequeuedItem = QueueItem.dequeue( realm );
        if ( dequeuedItem ) {
          const { id, payload: dequeuedPayload, type: dequeuedType } = dequeuedItem;
          // logger.info( `Dequeued item: ID=${id}, Type=${dequeuedType}` );
          // logger.info( `Dequeued payload: ${dequeuedPayload}` );

          if ( dequeuedType === "locale-change" || dequeuedType === "taxon-names-change" ) {
            // logger.info( `Processing ${dequeuedType} item` );
            // if ( dequeuedType === "taxon-names-change" ) {
            //   logger.info( "Initiating taxon names update with API" );
            // }
            setDequeuedItemId( id );
            updateUserMutate( dequeuedPayload );
          }
        }
      }
    } );
    return ( ) => {
      // logger.info( "Removing queue listeners" );
      // remember to remove listeners to avoid async updates
      queuedItems?.removeAllListeners( );
    };
  }, [realm, updateUserMutate, dequeuedItemId] );
};

export default useWorkQueue;
