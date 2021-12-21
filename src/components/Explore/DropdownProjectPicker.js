// flow

import React, { useState } from "react";
import type { Node } from "react";
// TODO: we'll probably need a custom dropdown picker which looks like a search bar
// and allows users to input immediately instead of first tapping the dropdown
// this is a placeholder to get functionality working
import DropDownPicker from "react-native-dropdown-picker";

import useFetchSearchResults from "./hooks/fetchSearchResults";
import { viewStyles } from "../../styles/explore/explore";

type Props = {
  searchTerm: string,
  search: string => { },
  setProjectId: number => { },
  projectId: number
}

const ProjectPicker = ( { searchTerm, search, setProjectId, projectId }: Props ): Node => {
  const autocomplete = useFetchSearchResults( searchTerm, "projects" );

  const [open, setOpen] = useState( false );

  const items = autocomplete.map( project => {
    return {
      // TODO: match styling on the web
      label: project.title,
      value: project.id
    };
  } );

  return (
    <DropDownPicker
      open={open}
      value={projectId}
      items={items}
      setOpen={setOpen}
      setValue={setProjectId}
      searchable={true}
      disableLocalSearch={true}
      onChangeSearchText={search}
      placeholder="Search projects"
      style={viewStyles.dropdown}
    />
  );
};

export default ProjectPicker;
