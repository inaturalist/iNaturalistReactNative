import { getUTCDate } from "../sharedHelpers/dateAndTime";

class Photo {
  static mapApiToRealm( photo ) {
    return photo;
  }

  static saveLocalPhotoForUpload( observationPhoto ) {
    return {
      localFilePath: observationPhoto.uri,
      timeSynced: null,
      timeUpdatedLocally: getUTCDate( new Date( ) )
    };
  }

  static schema = {
    name: "Photo",
    // TODO: need uuid to be primary key for photos that get uploaded?
    properties: {
      id: "int?",
      attribution: "string?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      url: "string?",
      localFilePath: "string?",
      timeSynced: "date?",
      timeUpdatedLocally: "date?"
    }
  }
}

export default Photo;
