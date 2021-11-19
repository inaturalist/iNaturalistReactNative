import { define } from "factoria";

export default define( "RemotePhoto", faker => ( {
  id: faker.datatype.number( ),
  attribution: faker.lorem.sentence( ),
  license_code: "cc-by",
  url: faker.image.imageUrl( )
} ) );
