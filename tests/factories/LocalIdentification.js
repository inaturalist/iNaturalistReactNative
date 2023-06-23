import { define } from "factoria";

export default define( "LocalIdentification", faker => ( {
  uuid: faker.datatype.uuid( )
} ) );
