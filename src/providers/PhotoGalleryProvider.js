// @flow
import React, { useState, useEffect } from "react";
import type { Node } from "react";

import { PhotoGalleryContext } from "./contexts";
import usePhotos from "../components/PhotoLibrary/hooks/usePhotos";

type Props = {
  children: any
}

const options = {
  first: 28,
  assetType: "Photos",
  include: ["location"]
};

const PhotoGalleryProvider = ( { children }: Props ): Node => {
  const [isScrolling, setIsScrolling] = useState( false );
  const [photoOptions, setPhotoOptions] = useState( options );
  // Whether or not usePhotos can fetch photos now, e.g. if permissions have
  // been granted (Android), or if it's ok to request permissions (iOS). This
  // should be used by whatever component is using this context so that
  // photos are requested (and permissions are potentially requested) when
  // they are needed and not just when this provider initializes
  const [canRequestPhotos, setCanRequestPhotos] = useState( false );
  const photoFetchStatus = usePhotos( photoOptions, isScrolling, canRequestPhotos );
  const photosFetched = photoFetchStatus.photos;
  const fetchingPhotos = photoFetchStatus.fetchingPhotos;

  const [photoGallery, setPhotoGallery] = useState( {} );
  const [selectedPhotos, setSelectedPhotos] = useState( {} );

  const totalSelected = ( ) => {
    let total = 0;
    const albums = Object.keys( selectedPhotos );

    albums.forEach( album => {
      total += selectedPhotos[album].length;
    } );
    return total;
  };

  useEffect( ( ) => {
    if ( photosFetched ) {
      // $FlowFixMe
      const selectedAlbum = photoOptions.groupName || "All";

      if ( photoGallery[selectedAlbum]
        && photoGallery[selectedAlbum].length === photosFetched.length ) {
        return;
      }

      // store photo details in state so it's possible
      // to select mutiple photos across albums

      const updatedPhotoGallery = {
        ...photoGallery,
        [selectedAlbum]: photosFetched
      };

      setPhotoGallery( updatedPhotoGallery );
      setIsScrolling( false );
    }
  }, [photosFetched, photoGallery, photoOptions, setPhotoGallery] );

  const photoGalleryValue = {
    photoGallery,
    setPhotoGallery,
    isScrolling,
    setIsScrolling,
    photoOptions,
    setPhotoOptions,
    selectedPhotos,
    setSelectedPhotos,
    fetchingPhotos,
    totalSelected: totalSelected( ),
    canRequestPhotos,
    setCanRequestPhotos
  };

  return (
    <PhotoGalleryContext.Provider value={photoGalleryValue}>
      {children}
    </PhotoGalleryContext.Provider>
  );
};

export default PhotoGalleryProvider;
