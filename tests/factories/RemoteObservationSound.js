import { define } from "factoria";

import soundFactory from "./RemoteSound";

export default define( "RemoteObservationSound", faker => ( {
  id: faker.number.int( ),
  sound: soundFactory( "RemoteSound" ),
  uuid: faker.string.uuid( ),
} ) );
