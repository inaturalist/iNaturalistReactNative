import factory from "tests/factory";
import faker from "tests/helpers/faker";
import {
  prepareMediaForUpload
} from "uploaders";

const mockToJSON = jest.fn();

const mockPhoto = factory( "LocalPhoto", {
  id: faker.number.int( ),
  attribution: faker.lorem.sentence( ),
  licenseCode: "cc-by-nc",
  url: "https://example.com/photo.jpg"
} );

const mockObservationPhoto = factory( "LocalObservationPhoto", {
  photo: mockPhoto,
  toJSON: mockToJSON
} );

mockToJSON.mockReturnValue( {
  uuid: mockObservationPhoto.uuid,
  photo: mockPhoto // Make sure this matches the structure expected
} );

const mockObservationPhotoWithNullValues = factory( "LocalObservationPhoto", {
  photo: {
    ...mockPhoto,
    url: "https://example.com/photo/1.jpg",
    position: null,
    _updated_at: null
  }
} );

const mockObservationSound = factory( "LocalObservationSound", {
  file_url: "https://example.com/sound.mp3"
} );

describe( "prepareMediaForUpload", () => {
  test( "should handle photo objects correctly", () => {
    const result = prepareMediaForUpload( mockObservationPhoto );

    expect( mockToJSON ).toHaveBeenCalled( );

    expect( result ).toEqual( {
      uuid: mockObservationPhoto.uuid,
      photo: mockPhoto
    } );
  } );

  test( "should return the original object if it doesn't have a photo property", () => {
    const result = prepareMediaForUpload( mockObservationSound );

    expect( result ).toBe( mockObservationSound );
  } );

  test( "should handle nested photo objects with empty values", () => {
    const result = prepareMediaForUpload( mockObservationPhotoWithNullValues );

    expect( result ).toEqual( {
      uuid: mockObservationPhotoWithNullValues.uuid,
      photo: {
        id: mockObservationPhotoWithNullValues.photo.id,
        attribution: mockObservationPhotoWithNullValues.photo.attribution,
        licenseCode: mockObservationPhotoWithNullValues.photo.licenseCode,
        url: mockObservationPhotoWithNullValues.photo.url
      }
    } );
  } );
} );
