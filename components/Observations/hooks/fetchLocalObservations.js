// @flow

import { useEffect, useRef, useCallback, useState } from "react";
import Realm from "realm";

import Observation from "../../../models/Observation";

const useFetchLocalObservations = ( ): Array<Object> => {
  // The tasks will be set once the realm has opened and the collection has been queried.
  const [observations, setObservations] = useState( [] );
  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );
  // The first time we query the Realm tasks collection we add a listener to it.
  // We store the listener in "subscriptionRef" to be able to remove it when the component unmounts.
  const subscriptionRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      const config = {
        schema: [Observation.schema]
      };

      // Since this is a non-sync realm (there is no "sync" field defined in the "config" object),
      // the realm will be opened synchronously when calling "Realm.open"
      const realm = await Realm.open( config );
      realmRef.current = realm;

      // When querying a realm to find objects (e.g. realm.objects('Tasks')) the result we get back
      // and the objects in it are "live" and will always reflect the latest state.
      const localObservations = realm.objects( "Observation" );
      if ( localObservations?.length ) {
        setObservations( localObservations );
      }

      // Live queries and objects emit notifications when something has changed that we can listen for.
      subscriptionRef.current = localObservations;
      localObservations.addListener( ( /*collection, changes*/ ) => {
        // If wanting to handle deletions, insertions, and modifications differently you can access them through
        // the two arguments. (Always handle them in the following order: deletions, insertions, modifications)
        // If using collection listener (1st arg is the collection):
        // e.g. changes.insertions.forEach((index) => console.log('Inserted item: ', collection[index]));
        // If using object listener (1st arg is the object):
        // e.g. changes.changedProperties.forEach((prop) => console.log(`${prop} changed to ${object[prop]}`));

        // By querying the objects again, we get a new reference to the Result and triggers
        // a rerender by React. Setting the tasks to either 'tasks' or 'collection' (from the
        // argument) will not trigger a rerender since it is the same reference
        setObservations( realm.objects( "Observation" ) );
      } );
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, setObservations] );

  const closeRealm = useCallback( ( ) => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners( );
    subscriptionRef.current = null;

    const realm = realmRef.current;
    // If having listeners on the realm itself, also remove them using:
    // realm?.removeAllListeners( );
    realm?.close( );
    realmRef.current = null;
    setObservations( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

  return observations;
};

export default useFetchLocalObservations;
