// @flow

import React from "react";
import type { Node } from "react";

import PhotoCarousel from "../SharedComponents/PhotoCarousel";

type Props = {
  photos: Array<Object>,
  setSelectedPhoto?: Function,
  selectedPhoto?: number
}

const EvidenceList = ( { photos, setSelectedPhoto, selectedPhoto }: Props ): Node => (
  <PhotoCarousel
    photos={photos}
    setSelectedPhoto={setSelectedPhoto}
    selectedPhoto={selectedPhoto}
  />
);

export default EvidenceList;
