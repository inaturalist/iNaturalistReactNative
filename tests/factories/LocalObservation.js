import factory, { define } from "factoria";

export default define( "LocalObservation", faker => ( {
  _created_at: faker.date.past( ),
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
  user: factory( "LocalUser" ),
  qualityGrade: "research",
  latitude: Number( faker.address.latitude( ) ),
  longitude: Number( faker.address.longitude( ) ),
  description: faker.lorem.paragraph( )
} ) );
