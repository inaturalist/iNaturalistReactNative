import { define } from "factoria";

export default define( "LocalTaxon", faker => ( {
  _synced_at: faker.date.past( ),
  ancestor_ids: [1, 2, 3],
  id: faker.number.int( ),
  is_active: true,
  name: faker.person.fullName( ),
  preferred_common_name: faker.person.fullName( ),
  rank: "species",
  rank_level: 10,
} ) );
