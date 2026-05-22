import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import type { SortDescriptor } from "realm";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const deletionFilters
  = "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil";

const sortedFilters: SortDescriptor[] = [["needs_sync", true], ["_created_at", true]];

const useLocalObservationUuids = ( ) => {
  const realm = useRealm();
  const filteredObservations = realm.objects( "Observation" )
    .filtered( deletionFilters )
    .sorted( sortedFilters );

  // eslint-disable-next-line arrow-body-style
  const [localObservationUuids, setLocalObservationUuids] = useState<string[]>( () => {
    return filteredObservations.map( obs => obs.uuid as string );
  } );

  useEffect( ( ) => {
    if ( realm.isClosed ) {
      return () => {};
    }

    const handleChange = () => {
      setLocalObservationUuids( filteredObservations.map( obs => obs.uuid as string ) );
    };
    filteredObservations.addListener( handleChange );
    return () => {
      if ( !realm.isClosed ) {
        filteredObservations.removeListener( handleChange );
      }
    };
  }, [filteredObservations, realm] );

  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  useEffect( () => {
    if ( realm.isClosed ) {
      return () => {};
    }
    const unSyncedObservations = Observation.filterUnsyncedObservations( realm, true );
    const handleChange = ( collection: [] ) => {
      setNumUnuploadedObservations( collection.length );
    };
    unSyncedObservations.addListener( handleChange );
    return () => {
      if ( !realm.isClosed ) {
        unSyncedObservations.removeListener( handleChange );
      }
    };
  }, [realm, setNumUnuploadedObservations] );

  return localObservationUuids;
};

export default useLocalObservationUuids;
