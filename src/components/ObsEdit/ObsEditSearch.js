// @flow

import * as React from "react";
import { FlatList, Pressable, Text, Image } from "react-native";

import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import useRemoteObsEditSearchResults from "../../sharedHooks/useRemoteSearchResults";
import InputField from "../SharedComponents/InputField";
import { viewStyles, imageStyles } from "../../styles/search/search";

type Props = {
  source: string,
  handlePress: Function
}

const ObsEditSearch = ( {
  source,
  handlePress
}: Props ): React.Node => {
  const [q, setQ] = React.useState( "" );
  // choose users or taxa
  const list = useRemoteObsEditSearchResults( q, source );

  // TODO: when UI is finalized, make sure these list results are not duplicate UI
  // with Search or Projects; share components if possible
  const renderItem = ( { item } ) => {
    if ( source === "taxa" ) {
      const imageUrl = ( item && item.default_photo ) && { uri: item.default_photo.square_url };
      return (
        <Pressable
          onPress={( ) => handlePress( item.id )}
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
          onPress={( ) => handlePress( item.id )}
          style={viewStyles.row}
          testID={`ObsEditSearch.project.${item.id}`}
        >
          <Image
            source={{ uri: item.icon }}
            style={imageStyles.squareImage}
            testID={`ObsEditSearch.project.${item.id}.photo`}
          />
          <Text>{item.title}</Text>
        </Pressable>
      );
    }
  };

  return (
    <ViewNoFooter>
      <InputField
        handleTextChange={setQ}
        placeholder={source === "taxa" ? "search for taxa" : "search for projects"}
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
