import { define } from "factoria";

export default define( "ModelPrediction", faker => ( {
  name: faker.person.fullName( ),
  rank_level: faker.helpers.arrayElement( [
    100,
    70,
    60,
    50,
    40,
    30,
    20,
    10
  ] ),
  combined_score: faker.number.float( { min: 80, max: 100 } ),
  taxon_id: faker.number.int( )
} ) );
