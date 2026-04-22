import { define } from "factoria";

export default define( "LocalSound", faker => ( {
  id: faker.number.int( ),
  attribution: faker.lorem.sentence( ),
  licenseCode: "cc-by-nc",
  file_url: faker.system.filePath( ),
} ) );
