// @flow

import { CommonActions, useNavigation } from "@react-navigation/native";
import classNames from "classnames";
import AddObsBottomSheet from "components/AddObsBottomSheet/AddObsBottomSheet";
import { Body2 } from "components/SharedComponents";
import GradientButton from "components/SharedComponents/Buttons/GradientButton";
import { getCurrentRoute } from "navigation/navigationUtils";
import * as React from "react";
import { Modal, View } from "react-native";
import { log } from "sharedHelpers/logger";
import { useCurrentUser, useLayoutPrefs, useTranslation } from "sharedHooks";
import useStore, { zustandStorage } from "stores/useStore";

const logger = log.extend( "AddObsButton" );

const AddObsButton = ( ): React.Node => {
  const [showBottomSheet, setShowBottomSheet] = React.useState( false );
  const [showTooltip, setShowTooltip] = React.useState( false );

  const { t } = useTranslation();

  const openBottomSheet = React.useCallback( () => setShowBottomSheet( true ), [] );
  const closeBottomSheet = React.useCallback( () => setShowBottomSheet( false ), [] );

  const { isAllAddObsOptionsMode } = useLayoutPrefs( );
  const currentRoute = getCurrentRoute( );
  const currentUser = useCurrentUser( );

  // #region Tooltip logic

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
    // If logged out, user should see the tooltip after making their second observation
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

  // The tooltip should only appear once per app download. // delete
  // const tooltipIsVisible = !shownOnce[showKey] && triggerCondition; // delete?

  React.useEffect( () => {
    // The tooltip should only appear once per app download.
    if ( !shownOnce[showKey] && triggerCondition ) setShowTooltip( true );
  }, [shownOnce, triggerCondition] );

  const dismissTooltip = () => {
    setShowTooltip( false );
    setShownOnce( showKey );
    openBottomSheet();
  };

  // #endregion

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

  return (
    <>
      <Modal
        visible={showTooltip}
        animationType="fade"
        transparent
        onRequestClose={dismissTooltip}
      >
        <View className="flex-1 bg-black/50 items-center justify-end">
          {/* Tooltip */}
          <View className="relative bottom-[24px] items-center">
            <View className="bg-white rounded-2xl px-5 py-4">
              <Body2>{t( "Press-and-hold-to-view-more-options" )}</Body2>
            </View>
            <View
              className={classNames(
                "border-l-[10px] border-r-[10px] border-x-[#00000000]",
                "border-t-[16px] border-t-white mb-2"
              )}
            />
            <GradientButton
              sizeClassName="w-[69px] h-[69px]"
              onPress={() => {}}
              onLongPress={() => dismissTooltip()}
              accessibilityLabel={t( "Add-observations" )}
              accessibilityHint={t( "Shows-observation-creation-options" )}
            />
          </View>
        </View>
      </Modal>
      {/* match the animation timing on FadeInView.tsx */}
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
