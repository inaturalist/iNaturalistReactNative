import { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  ancestor_ids: [1, 2, 3],
  id: faker.number.int( ),
  name: faker.person.fullName( ),
  taxon_photos: [],
} ), {
  genus: faker => ( {
    rank: "genus",
    name: faker.person.firstName,
  } ),
} );
