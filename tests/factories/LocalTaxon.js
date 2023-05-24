import factory, { define } from "factoria";

export default define( "LocalTaxon", faker => ( {
  id: faker.datatype.number( ),
  name: faker.name.firstName( ),
  rank: "species",
  rank_level: 10,
  preferred_common_name: faker.name.fullName( ),
  defaultPhoto: factory( "LocalPhoto" )
} ) );
