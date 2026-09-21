import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useRef } from "react";

/**
 * Consumes navigation params that represent an EVENT rather than STATE, and
 * clears them as soon as they are delivered.
 *
 * Some params answer "what is this screen showing?" and belong in the route
 * for as long as the screen lives -- `uuid`, for instance. Others answer "what
 * did the user just do?", like "they picked taxon X at time T". Those are
 * events. Leaving an event in the route turns it into state, and then anything
 * that re-runs an effect -- a refetch, a remount after a tab switch, a
 * reconnect -- can deliver it a second time and restart a flow the user has
 * already finished or dismissed.
 *
 * This hook makes that impossible: the params are cleared before the handler
 * runs, so an event is delivered exactly once per navigation that carries it.
 * Callers do not have to remember to clear the params on each way out of the
 * flow, which is the part that tends to rot as exit paths are added.
 *
 * @param keys the param names that together make up the event
 * @param onEvent called once per navigation that supplies any of those params,
 *   with the route's params as they were when the event fired
 */
const useRouteEvent = <ParamList extends object>(
  keys: readonly ( keyof ParamList )[],
  onEvent: ( params: Partial<ParamList> ) => void,
): void => {
  const route = useRoute( );
  const navigation = useNavigation( );

  // The caller supplies ParamList, which is what asserts the shape of this
  // screen's params; react-navigation types `params` as unknown here. Kept as
  // the raw value so its identity is react-navigation's, not ours.
  const routeParams = route.params as Partial<ParamList> | undefined;

  const onEventRef = useRef( onEvent );
  useEffect( ( ) => {
    onEventRef.current = onEvent;
  }, [onEvent] );

  // Keyed on the params object itself. React Navigation builds a new params
  // object for every navigate/popTo/setParams and keeps it stable otherwise,
  // so this fires once per navigation that carries the event. Navigating in
  // twice with an identical payload still works, because clearing the params
  // puts a render with them absent in between.
  useEffect( ( ) => {
    const current: Partial<ParamList> = routeParams ?? {};
    if ( !keys.some( key => current[key] !== undefined ) ) return;

    // Clear first, so no later render can deliver this event again. Clearing
    // replaces the params object rather than mutating it, so `current` stays a
    // snapshot of the values this event carried. A handler that throws
    // synchronously would lose its event; handlers are expected to do their
    // work asynchronously and report their own failures.
    navigation.setParams(
      Object.fromEntries( keys.map( key => [key, undefined] ) ),
    );

    onEventRef.current( current );
  }, [routeParams, keys, navigation] );
};

export default useRouteEvent;
