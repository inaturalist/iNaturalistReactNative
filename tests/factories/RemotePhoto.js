import { define } from "factoria";

export default define( "RemotePhoto", faker => ( {
  id: faker.number.int( ),
  attribution: faker.lorem.sentence( ),
  license_ode: "cc-by-nc",
  url: faker.image.url( ),
  uuid: faker.string.uuid( )
} ) );
