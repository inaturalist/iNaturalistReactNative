// @flow

import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const { useRealm } = RealmContext;

const useObservationUpdatesWhenFocused = () => {
  const realm = useRealm();

  const setObservationUpdatesViewedRealm = useCallback( () => {
    // Set all observations to viewed
    const observations = realm
      .objects( "Observation" )
      .filtered( "comments_viewed == false OR identifications_viewed == false" );
    if ( observations.length === 0 ) { return; }
    safeRealmWrite( realm, () => {
      observations.forEach( observation => {
        observation.comments_viewed = true;
        observation.identifications_viewed = true;
      } );
    }, "setting comments_viewed and ids_viewed to true in useObservationsUpdatesWhenFocused" );
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
    return () => subscription?.remove();
  }, [onAppStateChange, setObservationUpdatesViewedRealm] );
};

export default useObservationUpdatesWhenFocused;
