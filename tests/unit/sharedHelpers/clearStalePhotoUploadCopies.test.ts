import { readDir, unlink } from "@dr.pogodin/react-native-fs";
import { photoUploadCopiesPath } from "appConstants/paths";
import { clearStalePhotoUploadCopies } from "sharedHelpers/clearCaches";

const mockedReadDir = jest.mocked( readDir );
const mockedUnlink = jest.mocked( unlink );

const copyFile = ( name: string, ageMs: number ) => ( {
  name,
  path: `${photoUploadCopiesPath}/${name}`,
  mtime: new Date( Date.now( ) - ageMs ),
} );

describe( "clearStalePhotoUploadCopies", ( ) => {
  beforeEach( ( ) => {
    mockedUnlink.mockClear( );
  } );

  it( "deletes upload copies older than an hour and keeps recent ones", async ( ) => {
    mockedReadDir.mockResolvedValueOnce( [
      copyFile( "orphaned.jpg", 2 * 60 * 60 * 1000 ),
      copyFile( "in-flight.jpg", 5 * 1000 ),
    ] as Awaited<ReturnType<typeof readDir>> );

    await clearStalePhotoUploadCopies( );

    expect( mockedReadDir ).toHaveBeenCalledWith( photoUploadCopiesPath );
    expect( mockedUnlink ).toHaveBeenCalledTimes( 1 );
    expect( mockedUnlink ).toHaveBeenCalledWith( `${photoUploadCopiesPath}/orphaned.jpg` );
  } );
} );
