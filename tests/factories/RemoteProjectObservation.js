import { define } from "factoria";

import projectFactory from "./RemoteProject";

export default define( "RemoteProjectObservation", faker => ( {
  uuid: faker.string.uuid(),
  id: faker.number.int(),
  project_id: faker.number.int(),
  project: projectFactory( "RemoteProject" ),
} ) );
