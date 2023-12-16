import { define } from "factoria";

export default define( "LocalTaxon", faker => ( {
  id: faker.number.int( ),
  name: faker.person.fullName( ),
  preferred_common_name: faker.person.fullName( ),
  rank: "species",
  rank_level: 10,
  taxon_photos: []
} ) );
