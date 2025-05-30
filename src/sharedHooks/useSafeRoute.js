import { useRoute } from "@react-navigation/native";

// import { log } from "../../react-native-logs.config";

// const logger = log.extend( "useSafeRoute" );

/**
 * Safely attempts to get the current route info, without crashing if not
 * inside a navigation context
 * @returns {Object} Route information or empty object if no route available
 */
const useSafeRoute = () => {
  try {
    const route = useRoute( );
    if ( route ) {
      return {
        routeName: route.name,
        routeParams: route.params
      };
    }
  } catch ( _e ) {
    // console.log( "Route not available from useSafeRoute" );
  }

  return {};
};

export default useSafeRoute;
