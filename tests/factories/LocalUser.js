import { define } from "factoria";

export default define( "LocalUser", faker => ( {
  id: faker.number.int( ),
  login: faker.internet.userName( ),
} ) );
