import { RealmContext } from "providers/contexts";
import type { RealmObservation } from "realmModels/types";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const { useRealm } = RealmContext;

interface UseLocalObservation {
  localObservation: RealmObservation | null;
  markDeletedLocally: ( ) => void;
  markViewedLocally: ( ) => void;
}

const useLocalObservation = ( uuid: string ): UseLocalObservation => {
  const realm = useRealm( );

  if ( !uuid ) {
    return {
      localObservation: null,
      markDeletedLocally: ( ) => {
        throw new Error( "UUID is required to update local observation" );
      },
      markViewedLocally: ( ) => {
        throw new Error( "UUID is required to mark local observation as viewed" );
      },
    };
  }

  const observation = realm.objectForPrimaryKey( "Observation", uuid );

  if ( !observation ) {
    return {
      localObservation: null,
      markDeletedLocally: ( ) => {
        throw new Error( "Trying to update non-existing local observation" );
      },
      markViewedLocally: ( ) => {
        throw new Error( "Trying to mark non-existing local observation as viewed" );
      },
    };
  }

  const markDeletedLocally = ( ) => {
    if ( realm.isClosed ) return;
    if ( !observation || !observation.isValid() ) return;
    safeRealmWrite( realm, ( ) => {
      observation._deleted_at = new Date( );
    }, "adding _deleted_at date in ObsDetailsContainer" );
  };

  const markViewedLocally = ( ) => {
    if ( realm.isClosed ) return;
    if ( !observation || !observation.isValid() ) return;
    safeRealmWrite( realm, ( ) => {
      // Flags if all comments and identifications have been viewed
      observation.comments_viewed = true;
      observation.identifications_viewed = true;
    }, "marking viewed locally in ObsDetailsContainer" );
  };

  return {
    localObservation: observation,
    markDeletedLocally,
    markViewedLocally,
  };
};

export default useLocalObservation;
