// @flow
import { useState } from "react";

const useSelectedPhotos = ( ): Object => {
  const [selectedPhotos, setSelectedPhotos] = useState( [] );
  const [rerenderList, setRerenderList] = useState( false );

  const selectPhoto = p => {
    const newSelection = selectedPhotos.concat( p ).sort( ( a, b ) => b.timestamp - a.timestamp );
    setSelectedPhotos( newSelection );
  };

  const unselectPhoto = item => {
    const newSelection = selectedPhotos;
    const selectedIndex = selectedPhotos.findIndex( p => p.image.uri === item.image.uri );
    newSelection.splice( selectedIndex, 1 );
    setSelectedPhotos( newSelection );
  };

  return {
    selectedPhotos,
    setSelectedPhotos,
    selectPhoto,
    unselectPhoto,
    rerenderList,
    setRerenderList
  };
};

export default useSelectedPhotos;
