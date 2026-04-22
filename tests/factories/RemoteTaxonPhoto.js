import { define } from "factoria";

import photoFactory from "./RemotePhoto";
import taxonFactory from "./RemoteTaxon";

export default define( "RemoteTaxonPhoto", faker => ( {
  taxon_id: faker.number.int( ),
  photo: photoFactory( "RemotePhoto" ),
  taxon: taxonFactory( "RemoteTaxon" ),
} ) );
