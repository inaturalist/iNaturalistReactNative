// @flow

import { fetchMemberProjects } from "api/users";
import ProjectList from "components/Projects/ProjectList";
import * as React from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

type Props = {
  userId: number
}

const UserProjects = ( { userId }: Props ): React.Node => {
  const {
    data: projects
  } = useAuthenticatedQuery(
    ["fetchMemberProjects", userId],
    optsWithAuth => fetchMemberProjects( { id: userId }, optsWithAuth )
  );

  return (
    <ProjectList data={projects} />
  );
};

export default UserProjects;
