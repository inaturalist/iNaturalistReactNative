import { define } from "factoria";

export default define( "LocalObservationSound", faker => ( {
  uuid: faker.string.uuid( ),
  file_url: faker.system.filePath( ),
  wasSynced: jest.fn( ( ) => false ),
  toJSON: jest.fn( ( ) => ( { } ) )
} ), {
  uploaded: faker => ( {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true )
  } )
} );
