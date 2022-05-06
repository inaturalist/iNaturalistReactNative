// flow

import React, { useState } from "react";
import type { Node } from "react";
import { Image } from "react-native";
// TODO: we'll probably need a custom dropdown picker which looks like a search bar
// and allows users to input immediately instead of first tapping the dropdown
// this is a placeholder to get functionality working
import DropDownPicker from "react-native-dropdown-picker";
import { t } from "i18next";

import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";
import { imageStyles, viewStyles } from "../../styles/explore/explore";

type Props = {
  searchQuery: string,
  setSearchQuery: string => { },
  setValue: number => { },
  sources: string,
  value: number,
  placeholder: string
}

const DropdownPicker = ( {
  searchQuery,
  setSearchQuery,
  setValue,
  sources,
  value,
  placeholder
}: Props ): Node => {
  const searchResults = useRemoteSearchResults( searchQuery, sources );

  const [open, setOpen] = useState( false );

  const placesItem = place => {
    return {
      label: place.name,
      value: place.uuid
    };
  };

  const taxonItem = taxa => {
    return {
      // TODO: match styling on the web; only show matched_term if the common name isn't clearly
      // linked to the search result
      label: `${taxa.preferred_common_name} (${taxa.matched_term})`,
      value: taxa.id,
      icon: ( ) => <Image source={{ uri: taxa.default_photo.url }} style={imageStyles.pickerIcon} />
    };
  };

  const userItem = user => {
    return {
      label: user.login,
      value: user.id,
      icon: ( ) => <Image source={{ uri: user.icon }} style={imageStyles.circularPickerIcon} />
    };
  };

  const projectItem = project => {
    return {
      label: project.title,
      value: project.id,
      icon: ( ) => <Image source={{ uri: project.icon }} style={imageStyles.pickerIcon} />
    };
  };

  const displayItems = ( ) => {
    if ( sources === "places" ) {
      return searchResults.map( item => placesItem( item ) );
    } else if ( sources === "taxa" ) {
      return searchResults.map( item => taxonItem( item ) );
    } else if ( sources === "users" ) {
      return searchResults.map( item => userItem( item ) );
    } else if ( sources === "projects" ) {
      return searchResults.map( item => projectItem( item ) );
    }
  };

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={displayItems( )}
      setOpen={setOpen}
      setValue={setValue}
      searchable={true}
      disableLocalSearch={true}
      onChangeSearchText={setSearchQuery}
      placeholder={t( placeholder )}
      style={viewStyles.dropdown}
    />
  );
};

export default DropdownPicker;
