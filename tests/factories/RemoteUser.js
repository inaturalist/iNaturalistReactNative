import { define } from "factoria";

export default define( "RemoteUser", faker => ( {
  name: faker.name.fullName(),
  login: faker.internet.userName(),
  email: faker.internet.email(),
  id: faker.datatype.number(),
  icon_url: faker.image.imageUrl(),
  roles: [faker.datatype.string()],
  created_at: "2000-05-09T01:17:05-01:00",
  updated_at: "2000-05-09T01:17:05-01:00",
  site_id: faker.datatype.number(),
  observations_count: faker.datatype.number(),
  species_count: faker.datatype.number(),
  identifications_count: faker.datatype.number(),
  journal_posts_count: faker.datatype.number()
} ) );
