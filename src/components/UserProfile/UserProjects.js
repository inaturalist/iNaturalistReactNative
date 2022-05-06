// @flow

import * as React from "react";

import useMemberProjects from "./hooks/useMemberProjects";
import ProjectList from "../Projects/ProjectList";

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

