// flow

import fetchSearchResults from "api/search";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Image } from "react-native";
// TODO: we'll probably need a custom dropdown picker which looks like a search bar
// and allows users to input immediately instead of first tapping the dropdown
// this is a placeholder to get functionality working
import DropDownPicker from "react-native-dropdown-picker";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import { imageStyles, viewStyles } from "styles/explore/explore";
import { useDebounce } from "use-debounce";

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
  // So we'll start searching only once the user finished typing
  const [finalSearch] = useDebounce( searchQuery, 500 );

  const {
    data: searchResults
  } = useAuthenticatedQuery(
    ["fetchSearchResults", finalSearch],
    optsWithAuth => fetchSearchResults( {
      q: finalSearch,
      sources
    }, optsWithAuth )
  );

  const placesItem = place => ( {
    label: place.name,
    value: place.uuid
  } );

  const taxonIcon = taxa => (
    <Image source={{ uri: taxa.default_photo.url }} style={imageStyles.pickerIcon} />
  );
  const userIcon = user => (
    <Image source={{ uri: user.icon }} style={imageStyles.circularPickerIcon} />
  );
  const projectIcon = project => (
    <Image source={{ uri: project.icon }} style={imageStyles.pickerIcon} />
  );

  const taxonItem = taxa => ( {
    // TODO: match styling on the web; only show matched_term if the common name isn't clearly
    // linked to the search result
    label: `${taxa.preferred_common_name} (${taxa.matched_term})`,
    value: taxa.id,
    icon: taxonIcon( taxa )
  } );
  const userItem = user => ( {
    label: user.login,
    value: user.id,
    icon: userIcon( user )
  } );

  const projectItem = project => ( {
    label: project.title,
    value: project.id,
    icon: projectIcon( project )
  } );

  const displayItems = ( ) => {
    if ( finalSearch === "" ) {
      return [];
    }
    if ( !searchResults ) { return []; }
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

  // TODO: change to the same style of dropdown as in SettingsRelationships?
  // this should be standardized throughout the app

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
