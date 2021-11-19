import factory, { define } from "factoria";

// TODO use faker for more of these dynamic values.
export default define( "LocalObservation", faker => ( {
  uuid: faker.datatype.uuid( ),
  comments: [
    factory( "LocalComment" ),
    factory( "LocalComment" ),
    factory( "LocalComment" )
  ],
  identifications: [
    factory( "LocalIdentification" )
  ],
  photos: [
    factory( "LocalPhoto" )
  ],
  placeGuess: "SF",
  taxon: factory( "LocalTaxon" ),
  timeObservedAt: "2021-05-09T07:27:05-06:00",
  qualityGrade: "research"
} ) );
