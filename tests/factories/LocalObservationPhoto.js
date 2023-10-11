import { define } from "factoria";

import photoFactory from "./LocalPhoto";

export default define( "LocalObservationPhoto", faker => ( {
  uuid: faker.datatype.uuid( ),
  photo: photoFactory( "LocalPhoto" )
} ) );
