import "./RemotePhoto";
import "./RemoteTaxon";
import "./RemoteUser";
import "./RemoteIdentification";

import factory, { define } from "factoria";

export default define( "RemoteObservation", faker => {
  const createdAt = faker.date.past( ).toString( );
  return {
    id: faker.datatype.number( ),
    uuid: faker.datatype.uuid( ),
    user: factory( "RemoteUser" ),
    identifications: [
      factory( "RemoteIdentification" )
    ],
    observation_photos: [
      factory( "RemoteObservationPhoto" )
    ],
    comments: [],
    taxon: factory( "RemoteTaxon" ),
    geojson: {
      coordinates: [1, 1]
    },
    created_at: "2022-11-27T19:07:41-08:00",
    updated_at: createdAt,
    time_observed_at: createdAt,
    location: "1,1",
    place_guess: "blah",
    quality_grade: "needs_id",
    description: faker.lorem.paragraph( )
  };
} );
