import { define } from "factoria";

export default define( "RemotePhoto", faker => ( {
  id: faker.number.int( ),
  attribution: "(c) username, some rights reserved (CC BY-NC)",
  license_code: "cc-by-nc",
  url: faker.image.url( ),
  uuid: faker.string.uuid( ),
} ) );
