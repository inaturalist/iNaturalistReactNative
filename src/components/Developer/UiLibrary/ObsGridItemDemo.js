import {
  Heading1,
  Heading2,
  ScrollViewWrapper
} from "components/SharedComponents";
import ObsGridItem from "components/SharedComponents/ObservationsFlashList/ObsGridItem";
import { View } from "components/styledComponents";
import React from "react";

import {
  makeObservation,
  makeObservationPhoto,
  makeObservationSound
} from "./ObsListItemDemo";

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const ObsGridItemDemo = ( ) => (
  <ScrollViewWrapper>
    <View className="p-2">
      <Heading1>Media Preview</Heading1>
      <Heading2 className="my-2">Photo</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [makeObservationPhoto()]
        } )}
      />
      <Heading2 className="my-2">Photos</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto()
          ]
        } )}
      />
      <Heading2 className="my-2">Sound + Photo</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [makeObservationPhoto()],
          observationSounds: [makeObservationSound()]
        } )}
      />
      <Heading2 className="my-2">Sound + Photos</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto()
          ],
          observationSounds: [makeObservationSound()]
        } )}
      />
      <Heading2 className="my-2">Sound</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationSounds: [makeObservationSound()]
        } )}
      />
      <Heading2 className="my-2">No Media</Heading2>
      <ObsGridItem
        observation={makeObservation()}
      />
      <Heading1>Upload</Heading1>
      <Heading2 className="my-2">Synced</Heading2>
      <ObsGridItem
        observation={{ uuid: "the-uuid", _synced_at: new Date( ) }}
        uploadState={false}
      />
      <Heading2 className="my-2">Upload needed</Heading2>
      <ObsGridItem observation={{ uuid: "the-uuid" }} />
      <Heading2 className="my-2">Upload in progress</Heading2>
      <ObsGridItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 0.4 } }}
      />
      <Heading2 className="my-2">Upload complete, w/ animation</Heading2>
      <ObsGridItem
        observation={{
          uuid: "the-uuid"
        }}
        uploadState={{ uploadProgress: { "the-uuid": 1 } }}
      />
      <Heading2 className="my-2">Upload complete, before animation</Heading2>
      <ObsGridItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 10 } }}
      />
      <Heading2 className="my-2">Upload complete, overlay of animated elements</Heading2>
      <ObsGridItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 11 } }}
      />
    </View>
  </ScrollViewWrapper>
);

export default ObsGridItemDemo;
