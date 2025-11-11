// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal";
import { Modal } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import { t } from "i18next";
import { navigationRef } from "navigation/navigationUtils";
import * as React from "react";
import { log } from "sharedHelpers/logger";
import { useCurrentUser, useLayoutPrefs } from "sharedHooks";
import useStore, { zustandStorage } from "stores/useStore";

const logger = log.extend( "AddObsButton" );

const AddObsButton = ( ): React.Node => {
  const [showModal, setShowModal] = React.useState( false );
  const [currentRoute, setCurrentRoute] = React.useState( null );

  const openModal = React.useCallback( () => setShowModal( true ), [] );
  const closeModal = React.useCallback( () => setShowModal( false ), [] );

  const { isAllAddObsOptionsMode } = useLayoutPrefs( );
  const currentUser = useCurrentUser( );

  // Controls whether to show the tooltip, and to show it only once to the user
  const showKey = "AddObsButtonTooltip";
  const shownOnce = useStore( state => state.layout.shownOnce );
  const setShownOnce = useStore( state => state.layout.setShownOnce );
  const justFinishedSignup = useStore( state => state.layout.justFinishedSignup );
  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );

  // Base trigger condition in all cases:
  // Only show the tooltip if the user has only AI camera as an option in this button.
  // Only show the tooltip on MyObservations screen.
  let triggerCondition = !isAllAddObsOptionsMode && currentRoute?.name === "ObsList";
  if ( justFinishedSignup ) {
    // If a user creates a new account, they should see the tooltip right after
    // dismissing the account creation pivot card and landing on My Obs.
    triggerCondition = triggerCondition && !!shownOnce["account-creation"];
  } else if ( numOfUserObservations === undefined
      || numOfUserObservations === null
      || typeof numOfUserObservations !== "number" ) {
    // If numOfUserObservations is undefined or null, we can not know if we should show the
    // tooltip to the user. Usually this happens when the user logs in before making an
    // observation, then we need to fetch the number of observations from server.
    triggerCondition = false;
  } else if ( !currentUser ) {
    // If a user is logged out, they should see the tooltip after making their second observation.
    triggerCondition = triggerCondition && numOfUserObservations > 1;
  } else if ( numOfUserObservations > 50 ) {
    // If a user logs in to an existing account with <=50 observations,
    // they should see the tooltip right after landing on My Obs after signing in
    //
    // If a user is already logged in and updates the app when tooltip is released,
    // they should see the tooltip the first time they open the app after updating
    //
    // Both those cases are covered by not changing the base trigger condition.
    //
    // If a user logs in to an existing account with >50 observations, they should
    // see the tooltip right after dismissing the "Welcome back!" pivot card
    // and landing on My Obs.
    triggerCondition = triggerCondition && !!shownOnce["fifty-observation"];
  }

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

  // The tooltip should only appear once per app download.
  const tooltipIsVisible = !shownOnce[showKey] && triggerCondition;

  React.useEffect( () => {
    // If the tooltip visibility condition changes from false to true,
    // we set the showModal state to true because the tooltip is in the modal.
    // We have a lot of modals in the app, so we use a timeout to avoid opening two modals
    // at the same time, like the PivotCards for example that in some cases were just closed
    // by the user.
    let timeoutId;
    if ( tooltipIsVisible ) {
      timeoutId = setTimeout( () => {
        openModal();
      }, 400 );
    }
    return () => {
      clearTimeout( timeoutId );
    };
  }, [tooltipIsVisible, openModal] );

  const resetObservationFlowSlice = useStore( state => state.resetObservationFlowSlice );
  const navigation = useNavigation( );

  React.useEffect( ( ) => {
    // don't remove this logger.info statement: it's used for internal
    // metrics. isAdvancedUser name is vestigial, changing it will make it
    // impossible to compare with older log data
    logger.info( `isAdvancedUser: ${isAllAddObsOptionsMode}` );
  }, [isAllAddObsOptionsMode] );

  const navAndCloseModal = ( screen, params ) => {
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

    closeModal( );
  };
  const navToARCamera = ( ) => { navAndCloseModal( "Camera", { camera: "AI" } ); };

  const addObsModal = (
    <AddObsModal
      closeModal={closeModal}
      navAndCloseModal={navAndCloseModal}
      tooltipIsVisible={tooltipIsVisible}
      dismissTooltip={( ) => {
        if ( tooltipIsVisible ) setShownOnce( showKey );
      }}
    />
  );

  return (
    <>
      {/* match the animation timing on FadeInView.tsx */}
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={250}
        animationOutTiming={250}
        showModal={showModal}
        closeModal={tooltipIsVisible
          ? undefined
          : closeModal}
        modal={addObsModal}
      />
      <GradientButton
        sizeClassName="w-[69px] h-[69px] mb-[5px]"
        onLongPress={() => {
          if ( !isAllAddObsOptionsMode ) openModal();
        }}
        onPress={() => {
          if ( isAllAddObsOptionsMode ) {
            openModal();
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
