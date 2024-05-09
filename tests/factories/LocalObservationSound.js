import { define } from "factoria";

import soundFactory from "./LocalSound";

export default define( "LocalObservationSound", faker => ( {
  uuid: faker.string.uuid( ),
  sound: soundFactory( "LocalSound" ),
  wasSynced: jest.fn( ( ) => false ),
  toJSON: jest.fn( ( ) => ( { } ) )
} ), {
  uploaded: faker => ( {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true )
  } )
} );
