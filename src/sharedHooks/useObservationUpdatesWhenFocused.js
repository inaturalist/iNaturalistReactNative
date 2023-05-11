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
      .filtered( "comments_viewed == false OR identifications_viewed == false" );
    realm?.write( () => {
      observations.forEach( observation => {
        observation.comments_viewed = true;
        observation.identifications_viewed = true;
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
