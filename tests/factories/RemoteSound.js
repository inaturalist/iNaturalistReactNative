import { define } from "factoria";

export default define( "RemoteSound", faker => ( {
  id: faker.number.int( ),
  attribution: "(c) username, some rights reserved (CC BY-NC)",
  license_code: "cc-by-nc",
  file_url: faker.image.url( ),
  file_content_type: faker.system.mimeType( ),
} ) );
