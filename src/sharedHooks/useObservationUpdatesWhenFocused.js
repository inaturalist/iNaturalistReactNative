// @flow

import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import { AppState } from "react-native";

const { useRealm } = RealmContext;

const useObservationUpdatesWhenFocused = () => {
  const realm = useRealm();

  const setObservationUpdatesViewedRealm = useCallback( () => {
    // Set all observations to viewed
    const observations = realm
      .objects( "Observation" )
      .filtered( "viewed_comments == false OR viewed_identifications == false" );
    realm?.write( () => {
      observations.forEach( observation => {
        observation.viewed_comments = true;
        observation.viewed_identifications = true;
      } );
    } );
  }, [realm] );

  const onAppStateChange = useCallback(
    status => {
      // if the app is coming back from the background, set all observations to viewed
      if ( status === "active" ) {
        setObservationUpdatesViewedRealm();
      }
    },
    [setObservationUpdatesViewedRealm]
  );

  useEffect( () => {
    // subscribe to app state changes
    const subscription = AppState.addEventListener(
      "change",
      onAppStateChange
    );
    setObservationUpdatesViewedRealm();

    // unsubscribe on unmount
    return () => subscription.remove();
  }, [onAppStateChange, setObservationUpdatesViewedRealm] );
};

export default useObservationUpdatesWhenFocused;
