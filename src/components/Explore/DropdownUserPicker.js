// flow

import React, { useState } from "react";
// import { Image } from "react-native";
import type { Node } from "react";
// TODO: we'll probably need a custom dropdown picker which looks like a search bar
// and allows users to input immediately instead of first tapping the dropdown
// this is a placeholder to get functionality working
import DropDownPicker from "react-native-dropdown-picker";

import useFetchSearchResults from "../../sharedHooks/fetchSearchResults";
import { viewStyles } from "../../styles/explore/explore";

type Props = {
  searchTerm: string,
  search: string => { },
  setUserId: number => { },
  userId: number
}

const UserPicker = ( { searchTerm, search, setUserId, userId }: Props ): Node => {
  const autocomplete = useFetchSearchResults( searchTerm, "users" );

  const [open, setOpen] = useState( false );

  const items = autocomplete.map( user => {
    return {
      // TODO: match styling on the web
      label: user.login,
      value: user.id
      // icon: ( ) => <Image source={{ uri: taxa.default_photo.url }} style={imageStyles.pickerIcon} />
    };
  } );

  return (
    <DropDownPicker
      open={open}
      value={userId}
      items={items}
      setOpen={setOpen}
      setValue={setUserId}
      searchable={true}
      disableLocalSearch={true}
      onChangeSearchText={search}
      placeholder="Search users"
      style={viewStyles.dropdown}
    />
  );
};

export default UserPicker;
