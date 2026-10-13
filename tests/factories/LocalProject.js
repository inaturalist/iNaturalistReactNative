import { define } from "factoria";

import pofFactory from "./LocalProjectObservationField";

export default define( "LocalProject", faker => ( {
  description: faker.lorem.paragraph(),
  icon: faker.image.url(),
  id: faker.number.int(),
  projectObservationFields: [pofFactory( "LocalProjectObservationField" )],
  project_observation_rules: [],
  project_type: "",
  rule_preferences: [],
  title: faker.lorem.sentence(),
} ) );
