import { Realm } from "@realm/react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

class Queue extends Realm.Object {
  static async enqueue( realm, payload, type ) {
    safeRealmWrite( realm, ( ) => {
      const queue = realm.objects( "Queue" );
      const nextId
        = queue.max( "id" ) != null
          ? queue.max( "id" ) + 1
          : 1;
      realm.create( "Queue", { id: nextId, payload, type } );
    }, `enqueued item with payload: ${payload}` );
  }

  static async dequeue( realm ) {
    const queue = realm.objects( "Queue" )?.sorted( "id" );
    if ( queue.length === 0 ) {
      return null;
    }

    const firstQueueItem = queue[0];
    const { payload } = firstQueueItem;
    safeRealmWrite( realm, ( ) => {
      realm.delete( firstQueueItem );
    }, `dequeued item with payload: ${payload}` );
    return payload;
  }

  static schema = {
    name: "Queue",
    properties: {
      id: "int",
      payload: "string?",
      type: "string?"
    }
  };
}

export default Queue;
