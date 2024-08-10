import mockFaker from "tests/helpers/faker";

export const nativeInterface = jest.fn( );
export const CameraRoll = {
  getPhotos: jest.fn( ( ) => ( {
    page_info: {
      end_cursor: jest.fn( ),
      has_next_page: false
    },
    edges: [
      // This expexcts something like
      // { node: photo }
    ]
  } ) ),
  getAlbums: jest.fn( ( ) => ( {
    // Expecting album titles as keys and photo counts as values
    // "My Amazing album": 12
  } ) ),
  save: jest.fn( ( _uri, _options = {} ) => mockFaker.system.filePath( ) )
};
