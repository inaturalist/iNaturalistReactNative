// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";

import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

type Props = {
  numOfUnuploadedObs: number,
  isLoggedIn: ?boolean,
  translateY: any,
  isExplore: boolean,
  setView: Function
}

const ObsListHeader = ( {
  numOfUnuploadedObs, isLoggedIn, translateY, isExplore, setView
}: Props ): Node => {
  if ( isLoggedIn === null ) {
    return <View className="rounded-bl-3xl rounded-br-3xl bg-primary h-24" />;
  }

  return (
    // $FlowIgnore
    <Animated.View style={[{ transform: [{ translateY }] }]}>
      <View className="rounded-bl-3xl rounded-br-3xl bg-primary h-24 justify-center">
        {isLoggedIn
          ? <UserCard />
          : <LoggedOutCard numOfUnuploadedObs={numOfUnuploadedObs} />}
      </View>
      <Toolbar
        isExplore={isExplore}
        isLoggedIn={isLoggedIn}
        setView={setView}
      />
    </Animated.View>
  );
};

export default ObsListHeader;
