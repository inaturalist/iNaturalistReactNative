import Photo from "./Photo";

class ObservationPhoto {
  static mapApiToRealm( observationPhoto ) {
    return {
      id: observationPhoto.id,
      position: observationPhoto.position,
      photo: Photo.mapApiToRealm( observationPhoto.photo ),
      uuid: observationPhoto.uuid
    };
  }

  static schema = {
    name: "ObservationPhoto",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      id: "int?",
      photo: "Photo?",
      position: "int?",
      // this creates an inverse relationship so observation photos
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationPhotos"
      }
    }
  }
}

export default ObservationPhoto;
