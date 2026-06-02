import type { Realm } from "@realm/react";
import { RealmContext } from "providers/contexts";
import {
  useEffect,
  useReducer,
} from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const deletionFilters
  = "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil";

const sortedFilters = [["needs_sync", true], ["_created_at", true]];

const getFilteredObservations = ( realm: Realm ) => realm.objects( "Observation" )
  .filtered( deletionFilters )
  .sorted( sortedFilters );

interface State {
  observationIds: string[];
  obsMissingBasicsUuids: string[];
}
const reducer = ( _state: State, newState: State ) => newState;

interface ObservationMinimal {
  uuid: string;
  needs_sync: boolean;
  missingBasics: () => boolean;
}
const idsFromObservations = ( observations: ObservationMinimal[] ) => ( {
  observationIds: observations.map( obs => obs.uuid ),
  obsMissingBasicsUuids: observations
    .filter( obs => obs.needs_sync && obs.missingBasics() )
    .map( obs => obs.uuid ),
} );

const initFromRealm = ( { realm }: { realm: Realm } ) => {
  if ( !realm || realm.isClosed ) {
    return { observationIds: [], obsMissingBasicsUuids: [] };
  }
  const filteredObservations = getFilteredObservations( realm );
  // TODO: finish typing enough to satisfy this file
  return idsFromObservations( Array.from( filteredObservations ) );
};

const useLocalObservationIds = ( ) => {
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const realm = useRealm( );
  const [state, dispatch]
    = useReducer( reducer, { realm }, initFromRealm );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      return () => {};
    }
    const filteredObservations = getFilteredObservations( realm );

    const handleChange = ( ) => {
      dispatch( idsFromObservations( Array.from( filteredObservations ) ) );

      // TODO: non-root components should not be responsible for syncing this state
      setNumUnuploadedObservations(
        Observation.filterUnsyncedObservations( realm ).length,
      );
    };

    filteredObservations.addListener( handleChange );
    return ( ) => {
      if ( filteredObservations && !realm.isClosed ) {
        filteredObservations.removeAllListeners( );
      }
    };
  }, [realm, setNumUnuploadedObservations] );

  return state;
};

export default useLocalObservationIds;
