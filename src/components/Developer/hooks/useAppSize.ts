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

export type DirectorySize = {
  name: string;
  size: number;
}

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
export function formatSizeUnits( bytes: number ) {
  let humanReadableSize = "";
  if ( bytes >= 1073741824 ) {
    humanReadableSize = `${( bytes / 1073741824 ).toFixed( 2 )} GB`;
  } else if ( bytes >= 1048576 ) {
    humanReadableSize = `${( bytes / 1048576 ).toFixed( 2 )} MB`;
  } else if ( bytes >= 1024 ) {
    humanReadableSize = `${( bytes / 1024 ).toFixed( 2 )} KB`;
  } else if ( bytes > 1 ) {
    humanReadableSize = `${bytes} bytes`;
  } else if ( bytes === 1 ) {
    humanReadableSize = `${bytes} byte`;
  } else {
    humanReadableSize = "0 bytes";
  }
  return humanReadableSize;
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

export const directories = sharedDirectories.concat( Platform.OS === "android"
  ? androidDirectories
  : iOSDirectories );

export function formatAppSizeString( name:string, size: number ): string {
  return `${name}: ${formatSizeUnits( size )}`;
}

export async function getDirectoryContentSizes( directory: string ): Promise<DirectorySize[]> {
  const contents = await RNFS.readDir( directory );
  const sortedContents = _.orderBy( contents, "size", "desc" );
  return sortedContents.map( ( { name, size } ) => ( {
    name,
    size
  } ) );
}

export function getTotalDirectorySize( directoryItems: DirectorySize[] ): number {
  const totalSize = directoryItems
    .map( item => item.size )
    .reduce( ( sum, current ) => sum + current, 0 );

  return totalSize;
}

type AppSize = {
  [directoryName: string]: DirectorySize[]
}

export async function fetchAppSize(): Promise<AppSize> {
  const existingDirectories = await Promise.all(
    directories.map( async directory => ( {
      directory,
      exists: await RNFS.exists( directory.path )
    } ) )
  );
  const filteredDirectories = existingDirectories
    .filter( dir => dir.exists )
    .map( dir => dir.directory );

  const directoryToDirectorySizesKvps = await Promise.all(
    filteredDirectories.map( async dir => {
      const contentSizes = await getDirectoryContentSizes( dir.path );
      return [dir.directoryName, contentSizes] as [string, DirectorySize[]];
    } )
  );
  const directorySizesByDirectory = Object.fromEntries( directoryToDirectorySizesKvps );
  return directorySizesByDirectory;
}

export default function useAppSize(): null | AppSize {
  const [appSize, setAppSize] = useState<null | AppSize>( null );

  useEffect( () => {
    async function fetchAndSetAppSize() {
      const appSize = await fetchAppSize();
      setAppSize( appSize );
    }
    fetchAndSetAppSize();
  }, [] );

  return appSize;
}
