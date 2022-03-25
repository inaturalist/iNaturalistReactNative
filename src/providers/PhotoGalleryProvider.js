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
  // photos are fetched from the server on initial render
  // and anytime a user scrolls through the photo gallery
  const photoFetchStatus = usePhotos( photoOptions, isScrolling );
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
    totalSelected: totalSelected( )
  };

  return (
    <PhotoGalleryContext.Provider value={photoGalleryValue}>
      {children}
    </PhotoGalleryContext.Provider>
  );
};

export default PhotoGalleryProvider;
