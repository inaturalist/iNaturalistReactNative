import { define } from "factoria";

import photoFactory from "./LocalPhoto";

export default define( "LocalObservationPhoto", faker => ( {
  uuid: faker.string.uuid( ),
  photo: photoFactory( "LocalPhoto" ),
  wasSynced: jest.fn( ( ) => false ),
  needsSync: jest.fn( ( ) => true ),
  toJSON: jest.fn( ( ) => ( { } ) )
} ), {
  uploaded: faker => ( {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true )
  } )
} );
