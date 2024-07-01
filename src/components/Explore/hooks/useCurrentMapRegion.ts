import { useNavigationState } from "@react-navigation/native";
import _ from "lodash";
import { useCallback } from "react";
import { Region } from "react-native-maps";
import useStore from "stores/useStore";

const useCurrentMapRegion = ( ) => {
  const mapRegion = useStore( s => s.mapRegion );
  const setMapRegion = useStore( s => s.setMapRegion );
  const rootMapRegion = useStore( s => s.rootMapRegion );
  const setRootMapRegion = useStore( s => s.setRootMapRegion );
  const navState = useNavigationState( nav => nav );
  const currentScreen = _.last( navState?.routes )?.name;

  const currentMapRegion: Region = currentScreen === "RootExplore"
    ? rootMapRegion
    : mapRegion;

  const setCurrentMapRegion = useCallback( ( newView: Region ) => {
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
