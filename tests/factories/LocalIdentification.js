import factory, { define } from "factoria";

export default define( "LocalIdentification", faker => ( {
  uuid: faker.datatype.uuid( ),
  createdAt: "2017-09-09T08:28:05-08:00",
  body: faker.lorem.sentence( ),
  user: factory( "LocalUser" ),
  taxon: factory( "LocalTaxon" )
} ) );
