// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";

import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

type Props = {
  numOfUnuploadedObs: number,
  translateY: any,
  isExplore: boolean,
  syncObservations: Function,
  setView: Function
}

const ObsListHeader = ( {
  numOfUnuploadedObs, translateY, isExplore, syncObservations, setView
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  if ( currentUser === null || currentUser === undefined ) {
    return <View className="rounded-bl-3xl rounded-br-3xl bg-primary h-24" />;
  }

  return (
    // $FlowIgnore
    <Animated.View style={[{ transform: [{ translateY }] }]}>
      <View className="rounded-bl-3xl rounded-br-3xl bg-primary h-24 justify-center">
        {currentUser
          ? <UserCard currentUser={currentUser} />
          : <LoggedOutCard numOfUnuploadedObs={numOfUnuploadedObs} />}
      </View>
      <Toolbar
        isExplore={isExplore}
        currentUser={currentUser}
        syncObservations={syncObservations}
        setView={setView}
      />
    </Animated.View>
  );
};

export default ObsListHeader;
