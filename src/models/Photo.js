class Photo {
  static PHOTO_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    url: true
  };

  static mapApiToRealm( photo ) {
    return photo;
  }

  static schema = {
    name: "Photo",
    // TODO: need uuid to be primary key for photos that get uploaded?
    properties: {
      id: "int?",
      attribution: "string?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      url: "string?",
      localFilePath: "string?"
    }
  }
}

export default Photo;
