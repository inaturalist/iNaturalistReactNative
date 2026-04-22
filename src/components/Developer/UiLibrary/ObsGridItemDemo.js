import ObsGridItem from "components/ObservationsFlashList/ObsGridItem";
import {
  Heading1,
  Heading2,
  ScrollViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

import {
  makeObservation,
  makeObservationPhoto,
  makeObservationSound,
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
          observationPhotos: [makeObservationPhoto()],
        } )}
      />
      <Heading2 className="my-2">Photos</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto(),
          ],
        } )}
      />
      <Heading2 className="my-2">20 Photos</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [...Array( 20 ).keys()].map( _idx => makeObservationPhoto() ),
        } )}
      />
      <Heading2 className="my-2">Sound + Photo</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [makeObservationPhoto()],
          observationSounds: [makeObservationSound()],
        } )}
      />
      <Heading2 className="my-2">Sound + Photos</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationPhotos: [
            makeObservationPhoto(),
            makeObservationPhoto(),
          ],
          observationSounds: [makeObservationSound()],
        } )}
      />
      <Heading2 className="my-2">Sound</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          observationSounds: [makeObservationSound()],
        } )}
      />
      <Heading2 className="my-2">No Media</Heading2>
      <ObsGridItem
        observation={makeObservation()}
      />
      <Heading1>Upload</Heading1>
      <Heading2 className="my-2">Synced</Heading2>
      <ObsGridItem
        observation={makeObservation( { _synced_at: new Date( ) } )}
      />
      <Heading2 className="my-2">Edit needed</Heading2>
      <ObsGridItem
        observation={makeObservation( {
          needsSync: () => true,
          missingBasics: () => true,
        } )}
        uploadProgress={0}
      />
      <Heading2 className="my-2">Upload needed</Heading2>
      <ObsGridItem observation={makeObservation()} uploadProgress={0} />
      <Heading2 className="my-2">Upload Queued</Heading2>
      <ObsGridItem observation={makeObservation()} uploadProgress={0} queued />
      <Heading2 className="my-2">Upload in progress</Heading2>
      <ObsGridItem
        observation={makeObservation()}
        uploadProgress={0.4}
      />
      <Heading2 className="my-2">Upload complete, w/ animation</Heading2>
      <ObsGridItem
        observation={makeObservation()}
        uploadProgress={1}
      />
      <Heading2 className="my-2">Upload complete, before animation</Heading2>
      <ObsGridItem
        observation={makeObservation()}
        uploadProgress={10}
      />
      <Heading2 className="my-2">Upload complete, overlay of animated elements</Heading2>
      <ObsGridItem
        observation={makeObservation()}
        uploadProgress={11}
      />
    </View>
  </ScrollViewWrapper>
);

export default ObsGridItemDemo;
