import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { savePhotosToCameraGallery } from "components/Camera/helpers/savePhotosToCameraGallery.ts";
import faker from "tests/helpers/faker";

describe( "userPrepareStoreAndNavigate", ( ) => {
  describe( "savePhotosToCameraGallery", ( ) => {
    it( "should call CameraRoll.save three times when given three uris", async ( ) => {
      const uris = [
        faker.system.filePath( ),
        faker.system.filePath( ),
        faker.system.filePath( )
      ];
      const mockOnEachSuccess = jest.fn( );
      await savePhotosToCameraGallery( uris, mockOnEachSuccess );
      // This should test that CameraRoll.save was called once for each of the
      // uris AND that it was called in the order of the uris array
      // https://jestjs.io/docs/mock-functions#custom-matchers
      const cameraRollSaveFirstArgs = CameraRoll.save.mock.calls.map( args => args[0] );
      expect( cameraRollSaveFirstArgs ).toEqual( uris );
    } );
  } );
} );
