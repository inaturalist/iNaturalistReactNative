import { define } from "factoria";
import { toJSON } from "tests/helpers/factoria";

import photoFactory from "./LocalPhoto";

export default define( "LocalObservationPhoto", faker => ( {
  uuid: faker.string.uuid( ),
  photo: photoFactory( "LocalPhoto" ),
  wasSynced: jest.fn( ( ) => false ),
  needsSync: jest.fn( ( ) => true ),
  toJSON,
} ), {
  uploaded: faker => ( {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
  } ),
} );
