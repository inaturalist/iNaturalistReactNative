import { useNavigationState } from "@react-navigation/native";
import _ from "lodash";

const useLastScreen = ( ): string => {
  const navState = useNavigationState( nav => nav );
  const history = navState?.routes.map( r => r.name );
  // remove current screen from navigation history
  history?.pop( );
  const lastScreen = _.last( history );
  return lastScreen;
};

export default useLastScreen;
