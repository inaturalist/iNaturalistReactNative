import { useEffect, useState } from "react";
import RNFS from "react-native-fs";

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatSizeUnits( bytes ) {
  if ( bytes >= 1073741824 ) {
    bytes = `${( bytes / 1073741824 ).toFixed( 2 )} GB`;
  } else if ( bytes >= 1048576 ) {
    bytes = `${( bytes / 1048576 ).toFixed( 2 )} MB`;
  } else if ( bytes >= 1024 ) {
    bytes = `${( bytes / 1024 ).toFixed( 2 )} KB`;
  } else if ( bytes > 1 ) {
    bytes += " bytes";
  } else if ( bytes === 1 ) {
    bytes += " byte";
  } else {
    bytes = "0 bytes";
  }
  return bytes;
}

const directories = [
  {
    path: RNFS.MainBundlePath,
    directoryName: "MainBundle"
  },
  {
    path: RNFS.DocumentDirectoryPath,
    directoryName: "DocumentDirectory"
  },
  {
    path: RNFS.CachesDirectoryPath,
    directoryName: "CachesDirectory"
  },
  {
    path: RNFS.TemporaryDirectoryPath,
    directoryName: "TemporaryDirectory"
  }, {
    path: RNFS.LibraryDirectoryPath,
    directoryName: "LibraryDirectory"
  }
];

function formatAppSizeString( name, size ) {
  return `${name}: ${formatSizeUnits( size )}`;
}

async function getDirectorySizes( ) {
  return Promise.all( directories.map( async ( { path, directoryName } ) => {
    const { size } = await RNFS.stat( path );

    return formatAppSizeString( directoryName, size );
  } ) );
}

async function getFileSizes( directory ) {
  const contents = await RNFS.readDir( directory );
  return Promise.all( contents.map( item => formatAppSizeString( item.name, item.size ) ) );
}

const useAppSize = ( ) => {
  const [contentSizes, setContentSizes] = useState( { } );
  const [directorySizes, setDirectorySizes] = useState( [] );

  useEffect( ( ) => {
    const fetchAppSize = async ( ) => {
      const sizes = await getDirectorySizes( );

      directories.map( async ( { path, directoryName } ) => {
        const fileSizes = await getFileSizes( path );

        if ( !contentSizes[directoryName] ) {
          contentSizes[directoryName] = fileSizes;
          setContentSizes( contentSizes );
        }
      } );
      setDirectorySizes( sizes );
    };
    fetchAppSize( );
  }, [contentSizes] );

  return {
    contentSizes,
    directorySizes
  };
};

export default useAppSize;
