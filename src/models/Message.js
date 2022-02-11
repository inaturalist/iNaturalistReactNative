import User from "./User";

class Message {
  static mimicRealmMappedPropertiesSchema( msg ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return; }
      return list.map( item => {
        return createFunction.mapApiToRealm( item );
      } );
    };

    const fromUser = User.mapApiToRealm( msg.from_user );
    const toUser = User.mapApiToRealm( msg.to_user );

    return {
      ...obs,
      subject: msg.subject,
      body: msg.body,
      fromUser,
      toUser,
      threadId: msg.thread_id
    };
  }

  static createMessageForRealm( msg, realm ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return; }
      return list.map( item => {
        return createFunction.mapApiToRealm( item, realm );
      } );
    };

    // const taxon = Taxon.mapApiToRealm( obs.taxon, realm );
    // const observationPhotos = createLinkedObjects( obs.observation_photos, ObservationPhoto );
    // const comments = createLinkedObjects( obs.comments, Comment );
    // const identifications = createLinkedObjects( obs.identifications, Identification );

    const newMsg = {
      ...msg,
        subject: msg.subject,
        body: msg.body,
        fromUser: User.mapApiToRealm( msg.from_user, realm ),
        toUser: User.mapApiToRealm( msg.to_user, realm ),
        threadId: msg.thread_id
    };
  
    //   ...obs,
    //   comments,
    //   identifications,
    //   // obs detail on web says geojson coords are preferred over lat/long
    //   // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
    //   latitude: obs.geojson.coordinates[1],
    //   longitude: obs.geojson.coordinates[0],
    //   observationPhotos,
    //   taxon
    // };

    // need to append user after the observation realm object has been created
    //delete newObs.user;//TODO
    return newMsg;
  }


  static schema = {
    name: "Message",
    primaryKey: "uuid",
    properties: {
      uuid: "string", //id?
      subject: "string", //optional??
      body: "string", //??optional
      from_user: "User?",
      to_user: "User?",
      thread_id: "string?", //integer
    }
  }
}

export default Observation;
