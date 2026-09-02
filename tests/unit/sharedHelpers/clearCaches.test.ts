import { computerVisionPath, photoUploadPath } from "appConstants/paths";
import { clearSyncedMediaForUpload } from "sharedHelpers/clearCaches";
import removeSyncedFilesFromDirectory from "sharedHelpers/removeSyncedFilesFromDirectory";

jest.mock( "sharedHelpers/removeSyncedFilesFromDirectory", ( ) => jest.fn( async ( ) => null ) );

const unsyncedObservation = {
  observationPhotos: [{
    photo: {
      localFilePath: `${photoUploadPath}/unsynced-upload.jpg`,
      cvFilePath: `${computerVisionPath}/unsynced-cv.jpg`,
    },
  }],
  observationSounds: [],
};

const realmStub = {
  objects: ( ) => ( { filtered: ( ) => [unsyncedObservation] } ),
};

const keepListFor = ( directory: string ) => {
  const call = ( removeSyncedFilesFromDirectory as jest.Mock ).mock.calls
    .find( args => args[0] === directory );
  return call?.[1];
};

describe( "clearSyncedMediaForUpload", ( ) => {
  beforeEach( async ( ) => {
    jest.clearAllMocks( );
    await clearSyncedMediaForUpload( realmStub );
  } );

  it( "sweeps the computer vision directory", ( ) => {
    expect( keepListFor( computerVisionPath ) ).toBeDefined( );
  } );

  it( "keeps the computer vision copy of a photo that has not synced yet", ( ) => {
    expect( keepListFor( computerVisionPath ) ).toEqual( ["unsynced-cv.jpg"] );
  } );

  it( "still keeps the upload copy of a photo that has not synced yet", ( ) => {
    expect( keepListFor( photoUploadPath ) ).toEqual( ["unsynced-upload.jpg"] );
  } );

  it( "omits photos with no computer vision copy from the keep list", async ( ) => {
    jest.clearAllMocks( );
    const noCvCopy = {
      observationPhotos: [{
        photo: { localFilePath: `${photoUploadPath}/only-upload.jpg`, cvFilePath: null },
      }],
      observationSounds: [],
    };

    await clearSyncedMediaForUpload( {
      objects: ( ) => ( { filtered: ( ) => [noCvCopy] } ),
    } );

    // An empty keep list means everything already in the directory is
    // reclaimable, which is correct when no unsynced photo references it
    expect( keepListFor( computerVisionPath ) ).toEqual( [] );
  } );
} );
