import { faker } from "@faker-js/faker";
import ObsListItem from "components/ObservationsFlashList/ObsListItem";
import {
  Heading1,
  Heading2,
  ScrollViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

export function makeObservation( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    missingBasics: ( ) => false,
    ...options,
  };
}

export function makePhoto( options = { } ) {
  return {
    id: faker.number.int( ),
    attribution: faker.lorem.sentence( ),
    licenseCode: "cc-by-nc",
    url: faker.image.url( ),
    ...options,
  };
}

export function makeObservationPhoto( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    photo: makePhoto( ),
    ...options,
  };
}

export function makeObservationSound( options = {} ) {
  return {
    uuid: faker.string.uuid( ),
    file_url: faker.system.filePath( ),
    ...options,
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
          observationPhotos: [makeObservationPhoto()],
        } )}
      />
      <Heading2 className="my-2">Photos</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto(),
          ],
        } )}
      />
      <Heading2 className="my-2">Sound + Photo</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [makeObservationPhoto()],
          observationSounds: [makeObservationSound()],
        } )}
      />
      <Heading2 className="my-2">Sound + Photos</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto(),
          ],
          observationSounds: [makeObservationSound()],
        } )}
      />
      <Heading2 className="my-2">Sound</Heading2>
      <ObsListItem
        observation={makeObservation( {
          observationSounds: [makeObservationSound()],
        } )}
      />
      <Heading2 className="my-2">No Media</Heading2>
      <ObsListItem
        observation={makeObservation()}
      />
      <ObsListItem
        observation={makeObservation( {
          taxon: {
            id: 123,
            iconic_taxon_name: "Insecta",
            preferred_common_name: "Some weird insect",
            name: "Foo bar",
            rank_level: 10,
          },
        } )}
      />
      <Heading1 className="my-2">Upload statuses</Heading1>
      <Heading2 className="my-2">Synced</Heading2>
      <ObsListItem
        observation={makeObservation( { _synced_at: new Date( ) } )}
      />
      <Heading2 className="my-2">Edit needed</Heading2>
      <ObsListItem
        observation={makeObservation( {
          needsSync: () => true,
          missingBasics: () => true,
        } )}
        uploadProgress={0}
      />
      <Heading2 className="my-2">Upload needed</Heading2>
      <ObsListItem observation={makeObservation()} uploadProgress={0} />
      <Heading2 className="my-2">Upload Queued</Heading2>
      <ObsListItem observation={makeObservation()} uploadProgress={0} queued />
      <Heading2 className="my-2">Upload in progress</Heading2>
      <ObsListItem
        observation={makeObservation()}
        uploadProgress={0.4}
      />
      <Heading2 className="my-2">Upload complete, w/ animation</Heading2>
      <ObsListItem
        observation={makeObservation()}
        uploadProgress={1}
      />
      <Heading2 className="my-2">Upload complete, w/ animation, w/ ID</Heading2>
      <ObsListItem
        observation={makeObservation( {
          uuid: "the-uuid",
          identifications: [{ uuid: "another-uuid", current: true }],
        } )}
        uploadProgress={1}
      />
      <Heading2 className="my-2">Upload complete, before animation</Heading2>
      <ObsListItem
        observation={makeObservation()}
        uploadProgress={10}
      />
      <Heading2 className="my-2">Upload complete, overlay of animated elements</Heading2>
      <ObsListItem
        observation={makeObservation()}
        uploadProgress={11}
        showUploadStatus
      />
    </View>
  </ScrollViewWrapper>
);

export default ObsListItemDemo;
