import { define } from "factoria";

export default define( "RemoteUser", faker => ( {
  login: faker.internet.userName( ),
  id: faker.datatype.number( ),
  icon_url: faker.image.imageUrl( )
} ) );
