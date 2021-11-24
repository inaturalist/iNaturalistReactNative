class Photo {
  static mapApiToRealm( photo ) {
    console.log( photo, "photo" );
    return {
      id: photo.id,
      attribution: photo.attribution,
      licenseCode: photo.license_code,
      url: photo.url
    };
  }

  static schema = {
    name: "Photo",
    // need uuid to be primary key for photos that get uploaded?
    properties: {
      id: "int?",
      attribution: "string?",
      licenseCode: "string?",
      url: "string?"
    }
  }
}

export default Photo;
