import { faker } from "@faker-js/faker";
import {
  Heading1,
  Heading2,
  ScrollViewWrapper
} from "components/SharedComponents";
import ObsListItem from "components/SharedComponents/ObservationsFlashList/ObsListItem";
import { View } from "components/styledComponents";
import React from "react";

export function makeObservation( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    ...options
  };
}

export function makePhoto( options = { } ) {
  return {
    id: faker.number.int( ),
    attribution: faker.lorem.sentence( ),
    licenseCode: "cc-by-nc",
    url: faker.image.url( ),
    ...options
  };
}

export function makeObservationPhoto( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    photo: makePhoto( ),
    ...options
  };
}

export function makeObservationSound( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    file_url: faker.system.filePath( ),
    ...options
  };
}

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-unescaped-entities */
const ObsListItemDemo = ( ) => (
  <ScrollViewWrapper>
    <View className="p-2">
      <Heading1 className="my-2">Media Preview</Heading1>
      <Heading2 className="my-2">Photo</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [makeObservationPhoto()]
        } )}
      />
      <Heading2 className="my-2">Photos</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto()
          ]
        } )}
      />
      <Heading2 className="my-2">Sound + Photo</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [makeObservationPhoto()],
          observationSounds: [makeObservationSound()]
        } )}
      />
      <Heading2 className="my-2">Sound + Photos</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto()
          ],
          observationSounds: [makeObservationSound()]
        } )}
      />
      <Heading2 className="my-2">Sound</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationSounds: [makeObservationSound()]
        } )}
      />
      <Heading2 className="my-2">No Media</Heading2>
      <ObsListItem
        observation={makeObservation()}
      />
      <Heading1 className="my-2">Upload statuses</Heading1>
      <Heading2 className="my-2">Synced</Heading2>
      <ObsListItem
        observation={{ uuid: "the-uuid", _synced_at: new Date( ) }}
        uploadState={false}
      />
      <Heading2 className="my-2">Upload needed</Heading2>
      <ObsListItem observation={{ uuid: "the-uuid" }} />
      <Heading2 className="my-2">Upload in progress</Heading2>
      <ObsListItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 0.4 } }}
      />
      <Heading2 className="my-2">Upload complete, w/ animation</Heading2>
      <ObsListItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 1 } }}
      />
      <Heading2 className="my-2">Upload complete, before animation</Heading2>
      <ObsListItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 10 } }}
      />
      <Heading2 className="my-2">Upload complete, overlay of animated elements</Heading2>
      <ObsListItem
        observation={{ uuid: "the-uuid" }}
        uploadState={{ uploadProgress: { "the-uuid": 11 } }}
      />
    </View>
  </ScrollViewWrapper>
);

export default ObsListItemDemo;
