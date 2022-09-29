// @flow

import ProjectList from "components/Projects/ProjectList";
import * as React from "react";

import useMemberProjects from "./hooks/useMemberProjects";

type Props = {
  userId: number
}

const UserProjects = ( { userId }: Props ): React.Node => {
  const projects = useMemberProjects( userId );

  return (
    <ProjectList data={projects} />
  );
};

export default UserProjects;
