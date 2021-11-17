class Photo {
  static createObjectForRealm( photo ) {
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
      url: "string?",
      // this creates an inverse relationship so photos
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "photos"
      }
    }
  }
}

export default Photo;
