import { useNavigationState } from "@react-navigation/native";
import _ from "lodash";
import { useCallback } from "react";
import useStore from "stores/useStore";

const useCurrentExploreView = ( ): Object => {
  const exploreView = useStore( state => state.exploreView );
  const setExploreView = useStore( state => state.setExploreView );
  const rootExploreView = useStore( state => state.rootExploreView );
  const setRootExploreView = useStore( state => state.setRootExploreView );
  const navState = useNavigationState( nav => nav );
  const currentScreen = _.last( navState?.routes )?.name;

  const currentExploreView = currentScreen === "RootExplore"
    ? rootExploreView
    : exploreView;

  const setCurrentExploreView = useCallback( newView => {
    if ( currentScreen === "RootExplore" ) {
      setRootExploreView( newView );
    } else {
      setExploreView( newView );
    }
  }, [currentScreen, setRootExploreView, setExploreView] );

  return {
    currentExploreView,
    setCurrentExploreView
  };
};

export default useCurrentExploreView;
