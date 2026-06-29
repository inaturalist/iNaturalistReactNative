import { define } from "factoria";

import pofFactory from "./RemoteProjectObservationField";

export default define( "RemoteProject", faker => ( {
  description: faker.lorem.paragraph( ),
  icon: faker.image.url( ),
  id: faker.number.int( ),
  project_observation_fields: [pofFactory( "RemoteProjectObservationField" )],
  project_type: "",
  rule_preferences: [],
  title: faker.lorem.sentence( ),
  user_ids: [faker.number.int( )],
} ) );
