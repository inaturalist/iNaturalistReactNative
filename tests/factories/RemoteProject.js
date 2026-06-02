import { define } from "factoria";

export default define( "RemoteProject", faker => ( {
  description: faker.lorem.paragraph( ),
  icon: faker.image.url( ),
  id: faker.number.int( ),
  rule_preferences: [],
  title: faker.lorem.sentence( ),
  user_ids: [faker.number.int( )],
} ) );
