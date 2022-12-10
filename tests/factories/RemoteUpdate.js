import { define } from "factoria";

export default define( "RemoteUpdate", faker => ( {
  viewed: false,
  resource_uuid: faker.datatype.uuid( )
} ) );
