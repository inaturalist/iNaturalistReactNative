import { define } from "factoria";

export default define( "LocalPhoto", faker => ( {
  id: faker.number.int( ),
  attribution: faker.lorem.sentence( ),
  licenseCode: "cc-by-nc",
  url: faker.image.url( ),
} ) );
