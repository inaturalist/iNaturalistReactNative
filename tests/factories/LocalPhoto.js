import { define } from "factoria";

export default define( "LocalPhoto", faker => ( {
  id: faker.datatype.number( ),
  attribution: faker.lorem.sentence( ),
  licenseCode: "cc-by-nc",
  url: faker.image.imageUrl( ),
  uuid: faker.datatype.uuid( )
} ) );
