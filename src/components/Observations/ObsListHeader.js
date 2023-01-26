// @flow

import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

import LoggedOutCard from "./LoggedOutCard";
import Toolbar from "./Toolbar";
import UserCard from "./UserCard";

type Props = {
  setView: Function
}

const ObsListHeader = ( {
  setView
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  if ( currentUser === null ) {
    return <View className="rounded-bl-3xl rounded-br-3xl bg-primary h-24" />;
  }

  return (
    // $FlowIgnore
    <>
      {currentUser
        ? <UserCard />
        : <LoggedOutCard />}
      <Toolbar setView={setView} />
    </>
  );
};

export default ObsListHeader;
