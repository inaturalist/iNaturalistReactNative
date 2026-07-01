import { define } from "factoria";

import pofFactory from "./LocalProjectObservationField";

export default define( "LocalProject", faker => ( {
  description: faker.lorem.paragraph(),
  icon: faker.image.url(),
  id: faker.number.int(),
  projectObservationFields: [pofFactory( "LocalProjectObservationField" )],
  project_type: "",
  title: faker.lorem.sentence(),
} ) );
