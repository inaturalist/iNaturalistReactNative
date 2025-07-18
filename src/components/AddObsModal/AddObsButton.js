// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import AddObsModal from "components/AddObsModal/AddObsModal.tsx";
import { Body2, Modal } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton.tsx";
import { t } from "i18next";
import { getCurrentRoute } from "navigation/navigationUtils.ts";
import * as React from "react";
import Tooltip from "react-native-walkthrough-tooltip";
import { log } from "sharedHelpers/logger";
import { useCurrentUser, useLayoutPrefs } from "sharedHooks";
import useStore, { zustandStorage } from "stores/useStore";

const logger = log.extend( "AddObsButton" );

const AddObsButton = ( ): React.Node => {
  const [showModal, setModal] = React.useState( false );

  const openModal = React.useCallback( () => setModal( true ), [] );
  const closeModal = React.useCallback( () => setModal( false ), [] );

  const { isAllAddObsOptionsMode } = useLayoutPrefs( );
  const currentRoute = getCurrentRoute( );
  const currentUser = useCurrentUser( );

  // Controls whether to show the tooltip, and to show it only once to the user
  const showKey = "AddObsButtonTooltip";
  const shownOnce = useStore( state => state.layout.shownOnce );
  const setShownOnce = useStore( state => state.layout.setShownOnce );
  // const justFinishedSignup = useStore( state => state.layout.justFinishedSignup );
  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );
  // Base trigger condition in all cases:
  // Only show the tooltip if the user has only AI camera as an option in this button.
  // Only show the tooltip on MyObservations screen.
  let triggerCondition = !isAllAddObsOptionsMode && currentRoute?.name === "ObsList";
  // If logged out, user should see the tooltip after making their second observation
  if ( !currentUser ) {
    // If a user is logged out, they should see the tooltip after making their second observation.
    triggerCondition = triggerCondition && numOfUserObservations > 1;
  } else {
    // Temporarily disabled the tooltip for new users, as it is freezing the app in some cases.
    triggerCondition = false;
  }
  // else if ( justFinishedSignup ) {
  //   // If a user creates a new account, they should see the tooltip right after
  //   // dismissing the account creation pivot card and landing on My Obs.
  //   // Because of the above check for logged out users, we can assume
  //   // that the user here has either 0 or 1 observation. Which in turn
  //   // currently means that we show the account creation pivot card.
  //   triggerCondition = triggerCondition && !!shownOnce["account-creation"];
  // } else if ( numOfUserObservations > 50 ) {
  //   // If a user logs in to an existing account with <=50 observations,
  //   // they should see the tooltip right after landing on My Obs after signing in
  //   //
  //   // If a user is already logged in and updates the app when tooltip is released,
  //   // they should see the tooltip the first time they open the app after updating
  //   //
  //   // Both those cases are covered by not changing the base trigger condition.
  //   //
  //   // If a user logs in to an existing account with >50 observations, they should
  //   // see the tooltip right after dismissing the "Welcome back!" pivot card
  //   // and landing on My Obs.
  //   triggerCondition = triggerCondition && !!shownOnce["fifty-observation"];
  // }

  // The tooltip should only appear once per app download.
  const tooltipIsVisible = !shownOnce[showKey] && triggerCondition;

  const contentStyle = {
    height: 50,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16
  };

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

  const addObsModal = <AddObsModal closeModal={closeModal} navAndCloseModal={navAndCloseModal} />;

  return (
    <>
      {/* match the animation timing on FadeInView.tsx */}
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={250}
        animationOutTiming={250}
        showModal={showModal}
        closeModal={closeModal}
        modal={addObsModal}
      />
      <Tooltip
        isVisible={tooltipIsVisible}
        content={(
          <Body2>
            {t( "Press-and-hold-to-view-more-options" )}
          </Body2>
        )}
        contentStyle={contentStyle}
        placement="top"
        arrowSize={{ width: 21, height: 16 }}
        backgroundColor="rgba(0,0,0,0.7)"
        disableShadow
      >
        <GradientButton
          sizeClassName="w-[69px] h-[69px] mb-[5px]"
          onLongPress={() => {
            if ( tooltipIsVisible ) setShownOnce( showKey );
            if ( !isAllAddObsOptionsMode ) openModal();
          }}
          onPress={() => {
            if ( tooltipIsVisible ) {
              return;
            }
            if ( isAllAddObsOptionsMode ) {
              openModal( );
            } else {
              navToARCamera( );
            }
          }}
          accessibilityLabel={t( "Add-observations" )}
          accessibilityHint={isAllAddObsOptionsMode
            ? t( "Shows-observation-creation-options" )
            : t( "Opens-AI-camera" )}
          iconName={isAllAddObsOptionsMode && "plus"}
          iconSize={isAllAddObsOptionsMode && 31}
        />
      </Tooltip>
    </>
  );
};

export default AddObsButton;
