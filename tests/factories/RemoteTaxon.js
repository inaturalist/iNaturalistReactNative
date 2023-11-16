import { define } from "factoria";

export default define( "RemoteTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.fullName( )
} ), {
  genus: faker => ( {
    rank: "genus",
    name: faker.name.firstName
  } )
} );
