import factory, { define } from "factoria";

// TODO use faker for more of these dynamic values.
export default define( "LocalObservation", faker => ( {
  _created_at: "1966-05-06T07:27:06-08:00",
  uuid: faker.datatype.uuid( ),
  comments: [
    factory( "LocalComment" ),
    factory( "LocalComment" ),
    factory( "LocalComment" )
  ],
  identifications: [
    factory( "LocalIdentification" )
  ],
  observationPhotos: [
    factory( "LocalObservationPhoto" )
  ],
  placeGuess: "SF",
  taxon: factory( "LocalTaxon" ),
  timeObservedAt: "2021-05-09T07:27:05-06:00",
  user: factory( "LocalUser" ),
  qualityGrade: "research",
  latitude: Number( faker.address.latitude( ) ),
  longitude: Number( faker.address.longitude( ) ),
  description: faker.lorem.paragraph( )
} ) );
