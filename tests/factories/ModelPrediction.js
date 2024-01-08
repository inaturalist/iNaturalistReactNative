import { define } from "factoria";

export default define( "ModelPrediction", faker => ( {
  name: faker.person.fullName( ),
  rank: faker.helpers.arrayElement( [
    100,
    70,
    60,
    57,
    53,
    50,
    47,
    45,
    44,
    43,
    40,
    37,
    35,
    34.5,
    34,
    33.5,
    33,
    32,
    30,
    27,
    26,
    25,
    24,
    20,
    15,
    13,
    12,
    11,
    10,
    5
  ] ),
  score: faker.number.float( { min: 0.8, max: 1 } ),
  taxon_id: faker.number.int( )
} ) );
