// @flow

import * as React from "react";
import { Text, Image } from "react-native";
import { useRoute } from "@react-navigation/native";

import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useLocationName from "../../sharedHooks/useLocationName";

const ObsEdit = ( ): React.Node => {
  const { params } = useRoute( );
  const { photo } = params;

  const imageUri = { uri: photo.uri };
  const { location } = photo;
  const locationName = useLocationName( location.latitude, location.longitude );

  return (
    <ViewWithFooter>
      <Text>evidence of organism</Text>
      <Image source={imageUri} />
      <Text>{locationName}</Text>
      <Text>{`Lat: ${location.latitude}, Lon: ${location.longitude}`}</Text>
      <Text>{`Date & time: ${photo.timestamp}`}</Text>
      <Text>identification</Text>
      <Text>view inat id suggestions</Text>
      <Text>tap to search for taxa</Text>
      <Text>quick add id</Text>
      <Text>other data:</Text>
      <Text>geoprivacy dropdown</Text>
      <Text>is the organism wild dropdown</Text>
      <Text>add optional notes</Text>
      <Text>tap to add projects</Text>
      <Text>upload observation</Text>
    </ViewWithFooter>
  );
};

export default ObsEdit;
