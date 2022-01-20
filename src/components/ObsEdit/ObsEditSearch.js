// @flow

import * as React from "react";
import { FlatList, Pressable, Text, Image, View } from "react-native";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import useRemoteObsEditSearchResults from "../../sharedHooks/useRemoteSearchResults";
import InputField from "../SharedComponents/InputField";
import { viewStyles, imageStyles } from "../../styles/search/search";

type Props = {
  source: ?string,
  closeModal: Function,
  updateTaxaId: Function,
  updateProjectIds: Function
}

const ObsEditSearch = ( {
  source,
  closeModal,
  updateTaxaId,
  updateProjectIds
}: Props ): React.Node => {
  const [q, setQ] = React.useState( "" );
  const [queryType, setQueryType] = React.useState( "taxa" );
  // choose users or taxa
  const list = useRemoteObsEditSearchResults( q, queryType );

  const updateObsAndCloseModal = id => {
    if ( source === "taxa" ) {
      updateTaxaId( id );
    } else {
      updateProjectIds( id );
    }
    closeModal( );
  };

  const renderItem = ( { item } ) => {
    if ( source === "taxa" ) {
      const imageUrl = ( item && item.default_photo ) && { uri: item.default_photo.square_url };
      return (
        <Pressable
          onPress={( ) => updateObsAndCloseModal( item.id )}
          style={viewStyles.row}
          testID={`ObsEditSearch.taxa.${item.id}`}
        >
          <Image source={imageUrl} style={imageStyles.squareImage} testID={`ObsEditSearch.taxa.${item.id}.photo`} />
          <Text>{`${item.preferred_common_name} (${item.rank} ${item.name})`}</Text>
        </Pressable>
      );
    } else {
      return (
        <Pressable
          onPress={( ) => updateObsAndCloseModal( item.id )}
          style={viewStyles.row}
          testID={`ObsEditSearch.project.${item.id}`}
        >
          <Text>{item.id}</Text>
          <Image source={{ uri: item.icon }} style={imageStyles.projectIcon} testID={`ObsEditSearch.project.${item.id}.photo`}/>
          <Text>{item.title}</Text>
        </Pressable>
      );
    }
  };

  return (
    <ViewNoFooter>
      <InputField
        handleTextChange={setQ}
        placeholder={queryType === "taxa" ? "search for taxa" : "search for users"}
        text={q}
        type="none"
      />
        <FlatList
          data={list}
          renderItem={renderItem}
          testID="ObsEditSearch.listView"
        />
    </ViewNoFooter>
  );
};

export default ObsEditSearch;
