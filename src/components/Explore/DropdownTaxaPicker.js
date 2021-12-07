// flow

import React, { useState } from "react";
import { Image } from "react-native";
import type { Node } from "react";
// TODO: we'll probably need a custom dropdown picker which looks like a search bar
// and allows users to input immediately instead of first tapping the dropdown
// this is a placeholder to get functionality working
import DropDownPicker from "react-native-dropdown-picker";

import useFetchTaxaAutocomplete from "./hooks/fetchTaxaAutocomplete";
import { imageStyles, viewStyles } from "../../styles/explore/explore";

type Props = {
  searchTerm: string,
  search: string => { },
  setTaxaId: number => { },
  taxaId: number
}

const TaxaPicker = ( { searchTerm, search, setTaxaId, taxaId }: Props ): Node => {
  const autocomplete = useFetchTaxaAutocomplete( searchTerm );

  const [open, setOpen] = useState( false );

  const items = autocomplete.map( taxa => {
    return {
      // TODO: match styling on the web; only show matched_term if the common name isn't clearly
      // linked to the search result
      label: `${taxa.preferred_common_name} (${taxa.matched_term})`,
      value: taxa.id,
      icon: ( ) => <Image source={{ uri: taxa.default_photo.url }} style={imageStyles.pickerIcon} />
    };
  } );

  return (
    <DropDownPicker
      open={open}
      value={taxaId}
      items={items}
      setOpen={setOpen}
      setValue={setTaxaId}
      searchable={true}
      disableLocalSearch={true}
      onChangeSearchText={search}
      placeholder="Search taxon"
      style={viewStyles.dropdown}
    />
  );
};

export default TaxaPicker;
