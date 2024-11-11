import { Realm } from "@realm/react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

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
    const queue = realm.objects( "QueueItem" )?.sorted( "id" );
    if ( queue.length === 0 ) {
      return null;
    }

    const firstQueueItem = queue[0];
    return {
      ...firstQueueItem,
      payload: JSON.parse( firstQueueItem.payload )
    };
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
      type: "string?"
    }
  };
}

export default QueueItem;
