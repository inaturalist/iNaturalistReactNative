// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";

import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

const { diffClamp } = Animated;

const HEADER_HEIGHT = 101;

type Props = {
  isLoggedIn: ?boolean,
  scrollY: any,
  setView: Function
}

const ObsListHeader = ( {
  isLoggedIn, scrollY, setView
}: Props ): Node => {
  const scrollYClamped = diffClamp( scrollY.current, 0, HEADER_HEIGHT );

  if ( isLoggedIn === null ) {
    return <View className="rounded-bl-3xl rounded-br-3xl bg-primary h-24" />;
  }

  const translateY = scrollYClamped.interpolate( {
    inputRange: [0, HEADER_HEIGHT],
    // $FlowIgnore
    outputRange: [0, -HEADER_HEIGHT]
  } );

  return (
    // $FlowIgnore
    <Animated.View style={[{ transform: [{ translateY }] }]}>
      {isLoggedIn
        ? <UserCard />
        : <LoggedOutCard />}
      <Toolbar
        isLoggedIn={isLoggedIn}
        setView={setView}
      />
    </Animated.View>
  );
};

export default ObsListHeader;
