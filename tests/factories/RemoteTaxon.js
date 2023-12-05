import { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  id: faker.number.int( ),
  name: faker.person.fullName( )
} ), {
  genus: faker => ( {
    rank: "genus",
    name: faker.person.firstName
  } )
} );
