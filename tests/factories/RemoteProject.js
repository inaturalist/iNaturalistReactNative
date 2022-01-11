import { define } from "factoria";

export default define( "RemoteProject", faker => ( {
  id: faker.datatype.number( ),
  title: faker.lorem.sentence( ),
  icon: faker.image.imageUrl( )
} ) );
