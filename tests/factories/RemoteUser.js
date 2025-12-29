import { define } from "factoria";

export default define( "RemoteUser", faker => ( {
  name: faker.person.fullName(),
  login: faker.internet.userName(),
  email: faker.internet.email(),
  id: faker.number.int(),
  icon_url: faker.image.url(),
  roles: [faker.string.sample()],
  created_at: "2000-05-09T01:17:05-01:00",
  updated_at: "2000-05-09T01:17:05-01:00",
  site: {
    name: faker.string.sample(),
  },
  observations_count: faker.number.int(),
  species_count: faker.number.int(),
  identifications_count: faker.number.int(),
  journal_posts_count: faker.number.int(),
  monthly_supporter: false,
} ) );
