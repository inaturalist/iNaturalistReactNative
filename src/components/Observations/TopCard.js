// @flow

import type { Node } from "react";
import React from "react";
import { View } from "react-native";

import useLoggedIn from "../../sharedHooks/useLoggedIn";
import { viewStyles } from "../../styles/observations/topCard";
import LoggedOutCard from "./LoggedOutCard";
import UserCard from "./UserCard";

type Props = {
  numObsToUpload: number
}

const TopCard = ( { numObsToUpload }: Props ): Node => {
  const isLoggedIn = useLoggedIn( );
  if ( isLoggedIn === null ) {
    return <View style={viewStyles.topCard} />;
  }

  return isLoggedIn
    ? <UserCard />
    : <LoggedOutCard numObsToUpload={numObsToUpload} />;
};

export default TopCard;
