import {
  prepareMediaForUpload
} from "uploaders";

describe( "prepareMediaForUpload", () => {
  test( "should handle photo objects correctly", () => {
    const mockPhoto = {
      uuid: "photo-123",
      photo: {
        id: 456,
        url: "https://example.com/photo.jpg",
        attribution: "Test User",
        license_code: "CC-BY",
        original_dimensions: { width: 1200, height: 800 },
        metadata: null
      },
      toJSON: jest.fn().mockReturnValue( {
        uuid: "photo-123",
        photo: {
          id: 456,
          url: "https://example.com/photo.jpg",
          attribution: "Test User",
          license_code: "CC-BY",
          original_dimensions: { width: 1200, height: 800 },
          metadata: null
        }
      } )
    };

    const result = prepareMediaForUpload( mockPhoto );

    expect( mockPhoto.toJSON ).toHaveBeenCalled();

    expect( result ).toEqual( {
      uuid: "photo-123",
      photo: {
        id: 456,
        url: "https://example.com/photo.jpg",
        attribution: "Test User",
        license_code: "CC-BY",
        original_dimensions: { width: 1200, height: 800 }
      }
    } );
  } );

  test( "should return the original object if it doesn't have a photo property", () => {
    const mockSound = {
      uuid: "sound-123",
      file_url: "https://example.com/sound.mp3",
      license_code: "CC-BY"
    };

    const result = prepareMediaForUpload( mockSound );

    expect( result ).toBe( mockSound );
  } );

  test( "should handle nested photo objects with empty values", () => {
    const mockPhoto = {
      uuid: "photo-123",
      photo: {
        id: 456,
        url: "",
        attribution: null,
        license_code: "CC-BY",
        metadata: null
      },
      toJSON: jest.fn().mockReturnValue( {
        uuid: "photo-123",
        photo: {
          id: 456,
          url: "",
          attribution: null,
          license_code: "CC-BY",
          metadata: null
        }
      } )
    };

    const result = prepareMediaForUpload( mockPhoto );

    expect( result ).toEqual( {
      uuid: "photo-123",
      photo: {
        id: 456,
        url: "",
        license_code: "CC-BY"
      }
    } );
  } );
} );
