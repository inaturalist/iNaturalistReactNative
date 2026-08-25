import {
  copyFile,
  exists,
  mkdir,
} from "@dr.pogodin/react-native-fs";
import { photoLibraryPhotosPath } from "appConstants/paths";
import { moveSharedGroupedPhotos } from "sharedHelpers/shareExtensionFiles";
import { unlink } from "sharedHelpers/util";

jest.mock( "@dr.pogodin/react-native-fs", () => ( {
  __esModule: true,
  DocumentDirectoryPath: "document/directory/path",
  copyFile: jest.fn( ).mockResolvedValue( undefined ),
  exists: jest.fn( ).mockResolvedValue( true ),
  mkdir: jest.fn( ).mockResolvedValue( undefined ),
} ) );

jest.mock( "react-native", () => ( {
  Platform: { OS: "ios" },
} ) );

jest.mock( "sharedHelpers/util", () => ( {
  __esModule: true,
  unlink: jest.fn( ).mockResolvedValue( undefined ),
} ) );

const APP_GROUP_URI_1 = "file:///private/var/mobile/Containers/Shared/AppGroup/abc/photo1.jpeg";
const APP_GROUP_URI_2 = "file:///private/var/mobile/Containers/Shared/AppGroup/abc/photo2.jpeg";
const APP_GROUP_PATH_1 = "/private/var/mobile/Containers/Shared/AppGroup/abc/photo1.jpeg";
const APP_GROUP_PATH_2 = "/private/var/mobile/Containers/Shared/AppGroup/abc/photo2.jpeg";
const GALLERY_URI_1 = `file://${photoLibraryPhotosPath}/photo1.jpeg`;
const GALLERY_URI_2 = `file://${photoLibraryPhotosPath}/photo2.jpeg`;

beforeEach( ( ) => {
  jest.clearAllMocks( );
  exists.mockResolvedValue( true );
} );

describe( "moveSharedGroupedPhotos", ( ) => {
  it( "moves App Group share photos into galleryPhotos and preserves group shape", async () => {
    const groupedPhotos = [
      { photos: [{ image: { uri: APP_GROUP_URI_1 } }] },
      {
        photos: [
          { image: { uri: APP_GROUP_URI_2 } },
          { image: { uri: APP_GROUP_URI_1 } },
        ],
      },
    ];

    const staged = await moveSharedGroupedPhotos( groupedPhotos );

    expect( mkdir ).toHaveBeenCalledWith( photoLibraryPhotosPath );
    expect( copyFile ).toHaveBeenCalledWith(
      APP_GROUP_PATH_1,
      `${photoLibraryPhotosPath}/photo1.jpeg`,
    );
    expect( copyFile ).toHaveBeenCalledWith(
      APP_GROUP_PATH_2,
      `${photoLibraryPhotosPath}/photo2.jpeg`,
    );
    expect( unlink ).toHaveBeenCalledWith( APP_GROUP_PATH_1 );
    expect( staged ).toEqual( [
      { photos: [{ image: { uri: GALLERY_URI_1 } }] },
      {
        photos: [
          { image: { uri: GALLERY_URI_2 } },
          { image: { uri: GALLERY_URI_1 } },
        ],
      },
    ] );
  } );

  it( "leaves non-App-Group URIs unchanged within groups", async () => {
    const galleryUri = `file://${photoLibraryPhotosPath}/existing.jpeg`;
    const groupedPhotos = [
      { photos: [{ image: { uri: galleryUri }, timestamp: 1 }] },
    ];

    const staged = await moveSharedGroupedPhotos( groupedPhotos );

    expect( copyFile ).not.toHaveBeenCalled( );
    expect( staged ).toEqual( groupedPhotos );
  } );
} );
