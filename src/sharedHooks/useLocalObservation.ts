import { RealmContext } from "providers/contexts.ts";
import { Results } from "realm";
import type { RealmComment, RealmIdentification, RealmObservation } from "realmModels/types";

const { useRealm } = RealmContext;

interface Observation extends RealmObservation {
  visibleComments?: Results<RealmComment>;
  visibleIdentifications?: Results<RealmIdentification>;
}

const useLocalObservation = ( uuid: string ): Observation | null => {
  const realm = useRealm();

  if ( !uuid ) {
    return null;
  }

  const observation = realm.objectForPrimaryKey( "Observation", uuid );

  if ( !observation ) {
    return null;
  }

  Object.defineProperties( observation, {
    visibleComments: {
      get() {
        return this.comments
          ? this.comments.filtered( "hidden == false" )
          : [];
      }
    },
    visibleIdentifications: {
      get() {
        return this.identifications
          ? this.identifications.filtered( "hidden == false" )
          : [];
      }
    }
  } );

  return observation;
};

export default useLocalObservation;
