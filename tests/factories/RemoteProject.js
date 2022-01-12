import { define } from "factoria";

export default define( "RemoteProject", faker => ( {
  id: faker.datatype.number( ),
  title: faker.lorem.sentence( ),
  icon: faker.image.imageUrl( ),
  header_image_url: faker.image.imageUrl( ),
  description: faker.lorem.paragraph( )
} ) );
