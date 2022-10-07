// @flow

import type { Node } from "react";
import React from "react";
import { Animated, View } from "react-native";
import viewStyles from "styles/observations/header";

import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

type Props = {
  numOfUnuploadedObs: number,
  isLoggedIn: ?boolean,
  translateY: any,
  isExplore: boolean,
  headerHeight: number,
  syncObservations: Function,
  setView: Function
}

const ObsListHeader = ( {
  numOfUnuploadedObs, isLoggedIn, translateY, isExplore, headerHeight, syncObservations, setView
}: Props ): Node => {
  if ( isLoggedIn === null ) {
    return <View style={viewStyles.header} />;
  }

  const renderToolbar = ( ) => (
    <View style={[
      viewStyles.toolbar,
      isExplore && viewStyles.exploreButtons,
      { paddingTop: headerHeight }
    ]}
    >
      <Toolbar
        isExplore={isExplore}
        isLoggedIn={isLoggedIn}
        syncObservations={syncObservations}
        setView={setView}
        numOfUnuploadedObs={numOfUnuploadedObs}
      />
    </View>
  );

  return (
    // $FlowIgnore
    <Animated.View style={[{ transform: [{ translateY }] }]}>
      <View style={viewStyles.header}>
        {isLoggedIn
          ? <UserCard />
          : <LoggedOutCard numOfUnuploadedObs={numOfUnuploadedObs} />}
      </View>
      {renderToolbar( )}
    </Animated.View>
  );
};

export default ObsListHeader;
