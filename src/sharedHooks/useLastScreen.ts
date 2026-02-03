import { useNavigationState } from "@react-navigation/native";
import last from "lodash/last";

const useLastScreen = ( ): string => {
  const navState = useNavigationState( nav => nav );
  const history = navState?.routes.map( r => r.name );
  // remove current screen from navigation history
  history?.pop( );
  const lastScreen = last( history );
  return lastScreen;
};

export default useLastScreen;
