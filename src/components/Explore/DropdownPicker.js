// flow

import React from "react";
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
  placeholder: string,
  open: boolean,
  onOpen: Function,
  onClose: Function,
  zIndex: number,
  zIndexInverse: number
}

const DropdownPicker = ( {
  searchQuery,
  setSearchQuery,
  setValue,
  sources,
  value,
  placeholder,
  open,
  onOpen,
  onClose,
  zIndex,
  zIndexInverse
}: Props ): Node => {
  const searchResults = useRemoteSearchResults( searchQuery, sources );

  const placesItem = place => ( {
    label: place.name,
    value: place.uuid
  } );

  const taxonItem = taxon => {
    const icon = <Image source={{ uri: taxon.default_photo.url }} style={imageStyles.pickerIcon} />;
    return {
      // TODO: match styling on the web; only show matched_term if the common name isn't clearly
      // linked to the search result
      label: `${taxon.preferred_common_name} (${taxon.matched_term})`,
      value: taxon.id,
      icon
    };
  };
  const userItem = user => ( {
    label: user.login,
    value: user.id,
    icon: <Image source={{ uri: user.icon }} style={imageStyles.circularPickerIcon} />
  } );

  const projectItem = project => ( {
    label: project.title,
    value: project.id,
    icon: <Image source={{ uri: project.icon }} style={imageStyles.pickerIcon} />
  } );

  const displayItems = ( ) => {
    if ( sources === "places" ) {
      return searchResults.map( item => placesItem( item ) );
    } if ( sources === "taxa" ) {
      return searchResults.map( item => taxonItem( item ) );
    } if ( sources === "users" ) {
      return searchResults.map( item => userItem( item ) );
    } if ( sources === "projects" ) {
      return searchResults.map( item => projectItem( item ) );
    }
    return [];
  };

  return (
    <DropDownPicker
      onClose={onClose}
      zIndex={zIndex}
      zIndexInverse={zIndexInverse}
      open={open}
      onOpen={onOpen}
      value={value}
      items={displayItems( )}
      setValue={setValue}
      searchable
      disableLocalSearch
      onChangeSearchText={setSearchQuery}
      placeholder={t( placeholder )}
      style={viewStyles.dropdown}
    />
  );
};

export default DropdownPicker;
