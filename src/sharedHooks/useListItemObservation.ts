import { RealmContext } from "providers/contexts";
import { useEffect, useMemo, useReducer } from "react";
import type Realm from "realm";
import type { RealmObservation } from "realmModels/types";

const { useRealm } = RealmContext;

// Reads one observation for a list tile and re-renders the tile when it changes or is deleted.
//
// This replaces @realm/react's useObject in tiles, which registers 8 Realm listeners for an
// Observation during render, and registers them again every time a cell is recycled.
// Here there's one object listener, added after commit.
//
// The listener is shallow: it misses changes made only to a linked object, like a photo's sync
// state. Upload indicators still clear, because the uploader marks the observation itself last.
// If tiles ever require those changes, keyPaths ["*.*", "observationPhotos.photo.*"] covers them,
// at about a quarter of useObject's cost per subscription.
//
// Unlike useObject, this doesn't wait for an observation that isn't in Realm yet: tiles only get
// uuids whose observations are already stored. Any other caller has to preserve that ordering.
//
// A write that lands between the render and the listener being added won't re-render the tile
// until something else does. This window is milliseconds long, so its a trade-off we accept in
// light of the performance gains.
//
// Pass null to skip reading and subscribing, for a caller that already has the observation.
const useListItemObservation = ( uuid: string | null ): RealmObservation | null => {
  const realm = useRealm( );
  const [version, bumpVersion] = useReducer( ( count: number ) => count + 1, 0 );

  const observation = useMemo(
    ( ) => ( uuid
      ? realm.objectForPrimaryKey<RealmObservation>( "Observation", uuid )
      : null ),
    // version gives a new object after each change, so anything memoized on the observation's
    // identity downstream recomputes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [realm, uuid, version],
  );

  useEffect( ( ) => {
    if ( !uuid ) return ( ) => undefined;
    const subscribed = realm.objectForPrimaryKey<RealmObservation>( "Observation", uuid );
    if ( !subscribed?.isValid( ) ) return ( ) => undefined;
    const listener: Realm.ObjectChangeCallback<RealmObservation> = ( _object, changes ) => {
      if ( changes.deleted || changes.changedProperties.length > 0 ) bumpVersion( );
    };
    subscribed.addListener( listener );
    return ( ) => {
      if ( !realm.isClosed ) subscribed.removeListener( listener );
    };
  }, [realm, uuid] );

  return observation?.isValid( )
    ? observation
    : null;
};

export default useListItemObservation;
