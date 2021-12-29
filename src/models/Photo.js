class Photo {
  static mapApiToRealm( photo ) {
    return {
      id: photo.id,
      attribution: photo.attribution,
      license_code: photo.license_code,
      url: photo.url
    };
  }

  static schema = {
    name: "Photo",
    // need uuid to be primary key for photos that get uploaded?
    properties: {
      id: "int?",
      attribution: "string?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      url: "string?"
    }
  }
}

export default Photo;
