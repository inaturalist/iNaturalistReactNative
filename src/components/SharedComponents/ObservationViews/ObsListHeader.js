// @flow

import type { Node } from "react";
import React from "react";
import { View } from "react-native";

import viewStyles from "../../../styles/observations/header";
import LoggedOutCard from "./LoggedOutCard";
import UserCard from "./UserCard";

type Props = {
  numOfUnuploadedObs: number,
  isLoggedIn: ?boolean
}

const ObsListHeader = ( { numOfUnuploadedObs, isLoggedIn }: Props ): Node => {
  if ( isLoggedIn === null ) {
    return <View style={viewStyles.header} />;
  }

  return (
    <View style={viewStyles.header}>
      {isLoggedIn
        ? <UserCard />
        : <LoggedOutCard numOfUnuploadedObs={numOfUnuploadedObs} />}
    </View>
  );
};

export default ObsListHeader;
