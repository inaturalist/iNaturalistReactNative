// @flow
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

import LoggedOutCard from "./LoggedOutCard";
import ObsListToolbar from "./ObsListToolbar";
import UserCard from "./UserCard";

type Props = {
  setView: Function;
  view: string
}

const ObsListHeader = ( {
  setView,
  view
}: Props ): Node => {
  const currentUser = useCurrentUser( );

  return (
    // $FlowIgnore
    <>
      {currentUser
        ? <UserCard />
        : <LoggedOutCard />}
      <ObsListToolbar setView={setView} view={view} />
    </>
  );
};

export default ObsListHeader;
