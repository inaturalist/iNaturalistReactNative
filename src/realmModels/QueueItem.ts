import type { ApiUntypedParams } from "api/types";
import type { ObjectSchema } from "realm";
import Realm from "realm";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const MAX_TRIES = 3;

export interface DequeuedQueueItem {
  id: number;
  payload: ApiUntypedParams;
  type: string | null;
  tries: number;
  failedAt: Date | null;
}

// eslint-disable-next-line no-use-before-define
class QueueItem extends Realm.Object<QueueItem> {
  declare id: number;

  declare payload: string | null;

  declare type: string | null;

  declare tries: number;

  declare failedAt: Date | null;

  static enqueue( realm: Realm, payload: string, type: string ) {
    safeRealmWrite( realm, ( ) => {
      const queue = realm.objects( QueueItem );
      const maxId = queue.max( "id" );
      const nextId = typeof maxId === "number"
        ? maxId + 1
        : 1;
      realm.create( QueueItem, { id: nextId, payload, type } );
    }, `enqueued item with payload: ${payload}` );
  }

  static dequeue( realm: Realm ): DequeuedQueueItem | null {
    // Don't bother dequeuing items that failed in the last minute
    const oneMinuteAgo = new Date( Date.now() - ( 1_000 * 60 ) );
    const queue = realm
      .objects( QueueItem )
      ?.filtered( "failedAt == $0 || failedAt < $1", null, oneMinuteAgo )
      .sorted( "id" );
    if ( queue.length === 0 ) {
      return null;
    }

    const firstQueueItem = queue[0];
    return {
      ...firstQueueItem,
      payload: JSON.parse( firstQueueItem.payload ),
    };
  }

  // Mark an item as failed. If it's failed too many times, delete it.
  static markAsFailed( realm: Realm, id: number ) {
    const queuedItem = realm.objectForPrimaryKey( QueueItem, id );
    if ( !queuedItem ) return;
    if ( queuedItem.tries >= MAX_TRIES - 1 ) {
      QueueItem.deleteDequeuedItem( realm, queuedItem.id );
      return;
    }
    safeRealmWrite( realm, ( ) => {
      queuedItem.tries += 1;
      queuedItem.failedAt = new Date();
    }, "marking QueueItem as failed" );
  }

  static deleteDequeuedItem( realm: Realm, id: number ) {
    const dequeuedItem = realm.objectForPrimaryKey( QueueItem, id );
    if ( !dequeuedItem ) return;
    safeRealmWrite( realm, ( ) => {
      realm.delete( dequeuedItem );
    }, `dequeued item with payload: ${dequeuedItem.payload}` );
  }

  static schema: ObjectSchema = {
    name: "QueueItem",
    primaryKey: "id",
    properties: {
      id: "int",
      payload: "string?",
      type: "string?",
      tries: { type: "int", default: 0 },
      failedAt: "date?",
    },
  };
}

export default QueueItem;
