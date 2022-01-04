import factory, { define } from "factoria";

export default define( "RemoteIdentification", faker => ( {
  uuid: faker.datatype.number( ),
  created_at: "2001-09-09T08:28:05-07:00",
  body: faker.lorem.sentence( ),
  user: factory( "RemoteUser" ),
  taxon: factory( "RemoteTaxon" )
} ) );
