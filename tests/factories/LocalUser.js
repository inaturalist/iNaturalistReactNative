import { define } from "factoria";

export default define( "LocalUser", faker => ( {
  login: faker.internet.userName( ),
  id: faker.datatype.number( ),
  iconUrl: faker.image.imageUrl( ),
  locale: "en"
} ) );
