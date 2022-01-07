class Photo {
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
      url: "string?"
    }
  }
}

export default Photo;
