import { useNavigationState } from "@react-navigation/native";
import _ from "lodash";
import { useCallback } from "react";
import useStore from "stores/useStore";

const useCurrentMapRegion = ( ): Object => {
  const mapRegion = useStore( s => s.mapRegion );
  const setMapRegion = useStore( s => s.setMapRegion );
  const rootMapRegion = useStore( s => s.rootMapRegion );
  const setRootMapRegion = useStore( s => s.setRootMapRegion );
  const navState = useNavigationState( nav => nav );
  const currentScreen = _.last( navState?.routes ).name;

  const currentMapRegion = currentScreen === "RootExplore"
    ? rootMapRegion
    : mapRegion;

  const setCurrentMapRegion = useCallback( newView => {
    if ( currentScreen === "RootExplore" ) {
      setRootMapRegion( newView );
    } else {
      setMapRegion( newView );
    }
  }, [currentScreen, setRootMapRegion, setMapRegion] );

  return {
    currentMapRegion,
    setCurrentMapRegion
  };
};

export default useCurrentMapRegion;
