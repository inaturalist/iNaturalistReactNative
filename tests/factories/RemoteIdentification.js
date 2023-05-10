import factory, { define } from "factoria";

export default define( "RemoteIdentification", faker => ( {
  uuid: faker.datatype.uuid( ),
  body: faker.lorem.sentence( ),
  created_at: "2015-02-12T20:41:10-08:00",
  user: factory( "RemoteUser" ),
  taxon: factory( "RemoteTaxon" )
} ) );
