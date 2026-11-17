import { useNavigation } from "@react-navigation/native";
import type {
  ExploreStackScreenProps,
  TabStackParamList,
  TabStackScreenProps,
} from "navigation/types";
import { useCallback } from "react";

// Opens a new Explore search on top of the current one, so back returns to it
const usePushExplore = ( ) => {
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );

  return useCallback( ( params: TabStackParamList["Explore"] ) => {
    navigation
      .getParent<TabStackScreenProps<"Explore">["navigation"]>( )
      .push( "Explore", params );
  }, [navigation] );
};

export default usePushExplore;
