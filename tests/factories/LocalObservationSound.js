import { define } from "factoria";
import { toJSON } from "tests/helpers/factoria";

import soundFactory from "./LocalSound";

export default define( "LocalObservationSound", faker => ( {
  uuid: faker.string.uuid( ),
  sound: soundFactory( "LocalSound" ),
  wasSynced: jest.fn( ( ) => false ),
  toJSON,
} ), {
  uploaded: faker => ( {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
  } ),
} );
