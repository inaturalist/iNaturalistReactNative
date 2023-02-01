// @flow
import type { Node } from "react";
import React from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

import LoggedOutCard from "./LoggedOutCard";
import ObsListToolbar from "./ObsListToolbar";
import UserCard from "./UserCard";

type Props = {
  setLayout: Function;
  layout: string
}

const ObsListHeader = ( {
  setLayout,
  layout
}: Props ): Node => {
  const currentUser = useCurrentUser( );

  return (
    // $FlowIgnore
    <>
      {currentUser
        ? <UserCard />
        : <LoggedOutCard />}
      <ObsListToolbar setLayout={setLayout} layout={layout} />
    </>
  );
};

export default ObsListHeader;
