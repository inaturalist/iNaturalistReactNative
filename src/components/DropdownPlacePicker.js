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
  location: string,
  search: string => { },
  setPlaceId: number => { },
  placeId: number
}

const PlacePicker = ( { location, search, setPlaceId, placeId }: Props ): Node => {
  const places = useFetchSearchResults( location, "places" );

  const [open, setOpen] = useState( false );

  const items = places.map( place => {
    return {
      // TODO: match styling on the web
      label: place.name,
      // value needs to be place.uuid once that's returned from api v2
      value: place.uuid
    };
  } );

  return (
    <DropDownPicker
      open={open}
      value={placeId}
      items={items}
      setOpen={setOpen}
      setValue={setPlaceId}
      searchable={true}
      disableLocalSearch={true}
      onChangeSearchText={search}
      placeholder="Search places"
      style={viewStyles.dropdown}
    />
  );
};

export default PlacePicker;
