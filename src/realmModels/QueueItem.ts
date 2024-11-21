import { Realm } from "@realm/react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const MAX_TRIES = 3;

class QueueItem extends Realm.Object {
  static enqueue( realm, payload, type ) {
    safeRealmWrite( realm, ( ) => {
      const queue = realm.objects( "QueueItem" );
      const nextId
        = queue.max( "id" ) != null
          ? queue.max( "id" ) + 1
          : 1;
      realm.create( "QueueItem", { id: nextId, payload, type } );
    }, `enqueued item with payload: ${payload}` );
  }

  static dequeue( realm ) {
    // Don't bother dequeuing items that failed in the last minute
    const oneMinuteAgo = new Date( Date.now() - ( 1_000 * 60 ) );
    const queue = realm
      .objects( "QueueItem" )
      ?.filtered( "failedAt == $0 || failedAt < $1", null, oneMinuteAgo )
      .sorted( "id" );
    if ( queue.length === 0 ) {
      return null;
    }

    const firstQueueItem = queue[0];
    return {
      ...firstQueueItem,
      payload: JSON.parse( firstQueueItem.payload )
    };
  }

  // Mark an item as failed. If it's failed too many times, delete it.
  static markAsFailed( realm, id ) {
    const queuedItem = realm.objectForPrimaryKey( "QueueItem", id );
    if ( queuedItem.tries >= MAX_TRIES - 1 ) {
      QueueItem.deleteDequeuedItem( realm, queuedItem.id );
      return;
    }
    safeRealmWrite( realm, ( ) => {
      queuedItem.tries += 1;
      queuedItem.failedAt = new Date();
    }, "marking QueueItem as failed" );
  }

  static deleteDequeuedItem( realm, id ) {
    const dequeuedItem = realm.objectForPrimaryKey( "QueueItem", id );
    safeRealmWrite( realm, ( ) => {
      realm.delete( dequeuedItem );
    }, `dequeued item with payload: ${dequeuedItem.payload}` );
  }

  static schema = {
    name: "QueueItem",
    primaryKey: "id",
    properties: {
      id: "int",
      payload: "string?",
      type: "string?",
      tries: { type: "int", default: 0 },
      failedAt: "date?"
    }
  };
}

export default QueueItem;
