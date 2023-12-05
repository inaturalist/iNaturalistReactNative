import { define } from "factoria";

export default define( "RemoteIdentification", faker => ( {
  uuid: faker.string.uuid( )
} ) );
