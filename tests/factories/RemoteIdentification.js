import factory, { define } from "factoria";

export default define( "RemoteIdentification", faker => ( {
  uuid: faker.datatype.uuid( ),
  body: faker.lorem.sentence( ),
  created_at: "2015-02-13T05:12:05+00:00",
  user: factory( "RemoteUser" ),
  taxon: factory( "RemoteTaxon" )
} ) );
