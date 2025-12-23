import { define } from "factoria";

import photoFactory from "./RemotePhoto";

export default define( "RemoteObservationPhoto", faker => ( {
  id: faker.number.int( ),
  photo: photoFactory( "RemotePhoto" ),
  uuid: faker.string.uuid( ),
} ) );
