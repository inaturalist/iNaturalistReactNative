import { act, renderHook } from "@testing-library/react-native";
import { photoUploadPath } from "appConstants/paths";
import useEditLocalPhoto from "components/MediaViewer/hooks/useEditLocalPhoto";
import editLocalPhoto from "sharedHelpers/editLocalPhoto";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { unlink } from "sharedHelpers/util";
import * as uuid from "uuid";

jest.mock( "sharedHelpers/editLocalPhoto", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );

jest.mock( "sharedHelpers/util", ( ) => ( {
  ...jest.requireActual( "sharedHelpers/util" ),
  unlink: jest.fn( ),
} ) );

const originalPath = `${photoUploadPath}/original.jpg`;
const firstCopyPath = `${photoUploadPath}/first-copy.jpg`;
const secondCopyPath = `${photoUploadPath}/second-copy.jpg`;
const rotate = { rotation: 270 };

// Edits the original twice, as if rotating it twice: the second edit
// replaces the copy the first one wrote
const editTwice = async ( ) => {
  editLocalPhoto
    .mockResolvedValueOnce( firstCopyPath )
    .mockResolvedValueOnce( secondCopyPath );
  const { result } = renderHook( ( ) => useEditLocalPhoto( jest.fn( ) ) );
  await act( ( ) => result.current( originalPath, rotate ) );
  await act( ( ) => result.current( firstCopyPath, rotate ) );
};

describe( "useEditLocalPhoto", ( ) => {
  beforeEach( ( ) => {
    jest.clearAllMocks( );
  } );

  it( "should delete a copy an earlier edit wrote once a new edit replaces it", async ( ) => {
    await editTwice( );
    expect( unlink ).toHaveBeenCalledWith( firstCopyPath );
  } );

  it( "should keep the photo as it was before editing", async ( ) => {
    await editTwice( );
    expect( unlink ).not.toHaveBeenCalledWith( originalPath );
  } );

  describe( "with a saved observation that uses the first copy", ( ) => {
    const observationUuid = uuid.v4( );

    beforeEach( ( ) => {
      safeRealmWrite( global.realm, ( ) => {
        global.realm.create( "Observation", {
          uuid: observationUuid,
          observationPhotos: [{
            uuid: uuid.v4( ),
            photo: { localFilePath: firstCopyPath },
          }],
        } );
      }, "create Observation using an edited copy for useEditLocalPhoto test" );
    } );

    // So later tests don't find it
    afterEach( ( ) => {
      safeRealmWrite( global.realm, ( ) => {
        global.realm.delete(
          global.realm.objectForPrimaryKey( "Observation", observationUuid ),
        );
      }, "delete Observation after useEditLocalPhoto test" );
    } );

    it( "should keep the copy when a new edit replaces it", async ( ) => {
      await editTwice( );
      expect( unlink ).not.toHaveBeenCalled( );
    } );
  } );
} );
