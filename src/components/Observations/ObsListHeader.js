// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Animated } from "react-native";
import useCurrentUser from "sharedHooks/useCurrentUser";

import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

const { diffClamp } = Animated;

const HEADER_HEIGHT = 101;

type Props = {
  scrollY: any,
  setView: Function
}

const ObsListHeader = ( {
  scrollY, setView
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const scrollYClamped = diffClamp( scrollY.current, 0, HEADER_HEIGHT );

  if ( currentUser === null ) {
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
      {currentUser
        ? <UserCard />
        : <LoggedOutCard />}
      <Toolbar setView={setView} />
    </Animated.View>
  );
};

export default ObsListHeader;
