import { define } from "factoria";

// TODO use faker for more of these dynamic values. Also, would we really
// store timeObservedAt like this in Realm?!
export default define( "LocalObservation", faker => ( {
  uuid: faker.datatype.uuid( ),
  userPhoto: faker.image.imageUrl( ),
  commonName: "Insects",
  placeGuess: "SF",
  timeObservedAt: "May 1, 2021",
  identificationCount: 3,
  commentCount: 0,
  qualityGrade: "research"
} ) );
