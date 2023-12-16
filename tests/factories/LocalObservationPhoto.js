import { define } from "factoria";

import photoFactory from "./LocalPhoto";

export default define( "LocalObservationPhoto", faker => ( {
  uuid: faker.string.uuid( ),
  photo: photoFactory( "LocalPhoto" )
} ) );
