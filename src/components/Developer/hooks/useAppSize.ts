import {
  computerVisionPath,
  photoLibraryPhotosPath,
  photoUploadPath,
  rotatedOriginalPhotosPath,
  soundUploadPath
} from "appConstants/paths";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import RNFS from "react-native-fs";

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
export function formatSizeUnits( bytes ) {
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

const sharedDirectories = [
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
  },
  {
    path: computerVisionPath,
    directoryName: "ComputerVisionSuggestions"
  },
  {
    path: photoLibraryPhotosPath,
    directoryName: "PhotoLibraryPhotos"
  },
  {
    path: photoUploadPath,
    directoryName: "PhotoUploads"
  },
  {
    path: rotatedOriginalPhotosPath,
    directoryName: "RotatedOriginalPhotos"
  },
  {
    path: soundUploadPath,
    directoryName: "SoundUploads"
  }
];

const iOSDirectories = [
  {
    path: RNFS.MainBundlePath,
    directoryName: "MainBundle"
  },
  {
    path: RNFS.LibraryDirectoryPath,
    directoryName: "LibraryDirectory"
  }
];

const androidDirectories = [
  {
    path: RNFS.DownloadDirectoryPath,
    directoryName: "DownloadDirectory"
  },
  {
    path: RNFS.ExternalDirectoryPath,
    directoryName: "ExternalDirectory"
  },
  {
    path: RNFS.ExternalStorageDirectoryPath,
    directoryName: "ExternalStorageDirectory"
  }
];

export const directories = Platform.OS === "android"
  ? sharedDirectories.concat( androidDirectories )
  : iOSDirectories.concat( sharedDirectories );

export function formatAppSizeString( name, size ) {
  return `${name}: ${formatSizeUnits( size )}`;
}

export async function getDirectoryContentSizes( directory ) {
  const contents = await RNFS.readDir( directory );
  const sortedContents = _.orderBy( contents, "size", "desc" );
  return sortedContents.map( ( { name, size } ) => ( {
    name,
    size
  } ) );
}

export function getTotalDirectorySize( directory ) {
  let totalSizes = 0;

  directory.forEach( item => {
    totalSizes += item.size;
  } );

  return totalSizes;
}

const useAppSize = ( ) => {
  const [fileSizes, setFileSizes] = useState( { } );

  useEffect( ( ) => {
    const fetchAppSize = async ( ) => {
      // using some funky code here because react will only update state
      // once while in a for loop, so we need to create the whole fileSize
      // object and then setState to have this update the Developer UI
      // on first render. feel free to rewrite if there's a better way to do this
      const tempFileSizes = { };
      const size = await Promise.all( directories.map( async ( { directoryName, path } ) => {
        const pathExists = await RNFS.exists( path );
        if ( !pathExists ) { return null; }
        const contentSizes = await getDirectoryContentSizes( path );
        tempFileSizes[directoryName] = contentSizes;
        return tempFileSizes;
      } ) );
      if ( !_.isEmpty( size[0] ) ) {
        setFileSizes( size[0] );
      }
    };
    fetchAppSize( );
  }, [] );

  return fileSizes;
};

export default useAppSize;
