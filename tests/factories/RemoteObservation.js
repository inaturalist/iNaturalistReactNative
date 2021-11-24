import factory, { define } from "factoria";
import "./RemotePhoto";
import "./RemoteTaxon";
import "./RemoteUser";

export default define( "RemoteObservation", faker => ( {
  id: faker.datatype.number( ),
  uuid: faker.datatype.uuid( ),
  user: factory( "RemoteUser" ),
  identifications: [],
  observation_photos: [
    factory( "RemoteObservationPhoto" )
  ],
  comments: [],
  taxon: factory( "RemoteTaxon" ),
  geojson: {
    coordinates: [1,1]
  },
  created_at: "2021-11-09T08:28:05-08:00",
  updated_at: "2021-11-09T17:22:17-08:00",
  time_observed_at: "2021-11-08T21:54:41-08:00",
  location: "1,1",
  place_guess: "blah",
  quality_grade: "needs_id"
} ) );
