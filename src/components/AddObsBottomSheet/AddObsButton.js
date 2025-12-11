// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import AddObsBottomSheet from "components/AddObsBottomSheet/AddObsBottomSheet";
import AddObsTooltip from "components/AddObsBottomSheet/AddObsTooltip";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import { navigationRef } from "navigation/navigationUtils";
import * as React from "react";
import { log } from "sharedHelpers/logger";
import { useCurrentUser, useLayoutPrefs, useTranslation } from "sharedHooks";
import useStore, { zustandStorage } from "stores/useStore";

const logger = log.extend( "AddObsButton" );

const AddObsButton = ( ): React.Node => {
  const [showBottomSheet, setShowBottomSheet] = React.useState( false );
  const [showTooltip, setShowTooltip] = React.useState( false );
  const [currentRoute, setCurrentRoute] = React.useState( null );

  const { t } = useTranslation();

  const openBottomSheet = React.useCallback( () => setShowBottomSheet( true ), [] );
  const closeBottomSheet = React.useCallback( () => setShowBottomSheet( false ), [] );

  const { isAllAddObsOptionsMode } = useLayoutPrefs( );
  const currentUser = useCurrentUser( );

  // #region Tooltip logic

  // Controls whether to show the tooltip, and to show it only once to the user
  const showKey = "AddObsButtonTooltip";
  const shownOnce = useStore( state => state.layout.shownOnce );
  const setShownOnce = useStore( state => state.layout.setShownOnce );
  const justFinishedSignup = useStore( state => state.layout.justFinishedSignup );
  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );
  const obsCountLoaded = typeof numOfUserObservations === "number";

  React.useEffect( () => {
    let timeoutId = null;

    // We must know the route name and observation count before evaluating the triggerCondition
    // And, the tooltip should only appear once per app download.
    const shouldEvaluateTrigger = currentRoute?.name && obsCountLoaded && !shownOnce[showKey];

    if ( shouldEvaluateTrigger ) {
      // Base trigger condition in all cases:
      // Only show the tooltip if the user has the AI camera as the default button option.
      // Only show the tooltip on MyObservations screen.
      const onObsList = currentRoute?.name === "ObsList";
      const onlyAiCamera = !isAllAddObsOptionsMode;

      let triggerCondition = onObsList && onlyAiCamera;

      if ( justFinishedSignup ) {
        // If a user creates a new account, they should see the tooltip right after dismissing the
        // account creation pivot card and landing on My Obs.
        triggerCondition = triggerCondition && !!shownOnce["account-creation"];
      } else if ( !currentUser ) {
        // If logged out, user should see the tooltip after making their second observation
        triggerCondition = triggerCondition && numOfUserObservations > 1;
      } else if ( numOfUserObservations > 50 ) {
        // If a user logs in to an existing account with >50 observations, they should see the
        // tooltip right after dismissing the "Welcome back!" pivot card and landing on My Obs.
        triggerCondition = triggerCondition && !!shownOnce["fifty-observation"];

        // If a user logs in to an existing account with <=50 observations,
        // they should see the tooltip right after landing on My Obs after signing in
        //
        // If a user is already logged in and updates the app when tooltip is released,
        // they should see the tooltip the first time they open the app after updating
        //
        // Both those cases are covered by not changing the base trigger condition.
      }

      // We use a timeout to avoid opening/closing two modals at the same time, such as the
      // PivotCards that also appear on the MyObs screen.
      if ( triggerCondition ) {
        timeoutId = setTimeout( () => {
          setShowTooltip( true );
        }, 500 );
      }
    }

    return () => {
      if ( timeoutId != null ) {
        clearTimeout( timeoutId );
      }
    };
  }, [
    currentRoute,
    obsCountLoaded,
    numOfUserObservations,
    justFinishedSignup,
    currentUser,
    isAllAddObsOptionsMode,
    shownOnce
  ] );

  const dismissTooltip = () => {
    setShowTooltip( false );
    setShownOnce( showKey );
    openBottomSheet();
  };

  // #endregion

  // #region Navigation handling

  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const navigation = useNavigation( );
  React.useEffect( ( ) => {
    // don't remove this logger.info statement: it's used for internal
    // metrics. isAdvancedUser name is vestigial, changing it will make it
    // impossible to compare with older log data
    logger.info( `isAdvancedUser: ${isAllAddObsOptionsMode}` );
  }, [isAllAddObsOptionsMode] );

  const navAndCloseBottomSheet = ( screen, params ) => {
    if ( screen !== "ObsEdit" ) {
      resetObservationFlowSlice( );
    }

    // we need to reset the navigation stack whenever a user navigates from the AddObs wheel,
    // otherwise the user can end up closing out to a previous place in the stack, #1857
    navigation.dispatch(
      CommonActions.reset( {
        index: 0,
        routes: [
          {
            name: "NoBottomTabStackNavigator",
            state: {
              index: 0,
              routes: [
                {
                  name: screen,
                  params: { ...params, previousScreen: currentRoute }
                }
              ]
            }
          }
        ]
      } )
    );

    closeBottomSheet( );
  };
  const navToARCamera = ( ) => { navAndCloseBottomSheet( "Camera", { camera: "AI" } ); };

  // #endregion

  // Keeps currentRoute up-to-date for the use of both navigation & tooltip logic
  React.useEffect( () => {
    if ( navigationRef.isReady() ) {
      const current = navigationRef.getCurrentRoute();
      setCurrentRoute( current );
    }

    const unsubscribe = navigationRef.addListener( "state", () => {
      const current = navigationRef.getCurrentRoute();
      setCurrentRoute( current );
    } );

    return unsubscribe;
  }, [] );

  return (
    <>
      <AddObsTooltip isVisible={showTooltip} dismissTooltip={dismissTooltip} />
      <AddObsBottomSheet
        closeBottomSheet={closeBottomSheet}
        hidden={!showBottomSheet}
        navAndCloseBottomSheet={navAndCloseBottomSheet}
      />
      <GradientButton
        sizeClassName="w-[69px] h-[69px] mb-[5px]"
        onLongPress={() => {
          if ( !isAllAddObsOptionsMode ) openBottomSheet();
        }}
        onPress={() => {
          if ( isAllAddObsOptionsMode ) {
            openBottomSheet();
          } else {
            navToARCamera();
          }
        }}
        accessibilityLabel={t( "Add-observations" )}
        accessibilityHint={
          isAllAddObsOptionsMode
            ? t( "Shows-observation-creation-options" )
            : t( "Opens-AI-camera" )
        }
        iconName={isAllAddObsOptionsMode && "plus"}
        iconSize={isAllAddObsOptionsMode && 31}
      />
    </>
  );
};

export default AddObsButton;
