import { define } from "factoria";

export default define( "LocalIdentification", faker => ( {
  uuid: faker.string.uuid( ),
} ) );
