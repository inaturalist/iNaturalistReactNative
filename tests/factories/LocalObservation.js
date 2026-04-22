import { define } from "factoria";

export default define( "LocalObservation", faker => ( {
  uuid: faker.string.uuid( ),
  // This is a Realm object method that we use to see if a record was deleted or not
  isValid: jest.fn( ( ) => true ),
  wasSynced: jest.fn( ( ) => false ),
  missingBasics: jest.fn( ( ) => false ),
  needsSync: jest.fn( ( ) => true ),
  observationPhotos: [],
  observationSounds: [],
  viewed: jest.fn( ( ) => true ),
  unviewed: jest.fn( ( ) => false ),
  faves: jest.fn( ( ) => [] ),
} ), {
  uploaded: faker => ( {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
  } ),
} );
