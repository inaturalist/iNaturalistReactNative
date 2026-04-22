import { define } from "factoria";

import taxonFactory from "./RemoteTaxon";
import userFactory from "./RemoteUser";

export default define( "RemoteIdentification", faker => ( {
  uuid: faker.string.uuid( ),
  category: "improving",
  current: true,
  user: userFactory( "RemoteUser" ),
  taxon: taxonFactory( "RemoteTaxon" ),
} ) );
