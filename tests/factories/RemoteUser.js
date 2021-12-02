import { define } from "factoria";

export default define( "RemoteUser", faker => ( {
  login: faker.internet.userName( ),
  id: faker.datatype.number( ),
  icon_url: faker.image.imageUrl( ),
  roles: [
    faker.datatype.string( )
  ],
  created_at: "2000-05-09T01:17:05-01:00",
  site_id: faker.datatype.number( )
} ) );
