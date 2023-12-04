import { define } from "factoria";

export default define( "LocalObservation", faker => ( {
  uuid: faker.string.uuid( ),
  // This is a Realm object method that we use to see if a record was deleted or not
  isValid: jest.fn( ( ) => true ),
  wasSynced: jest.fn( ),
  needsSync: jest.fn( ),
  viewed: jest.fn( ( ) => true ),
  unviewed: jest.fn( ( ) => false )
} ), {
  unUploaded: {
    needsSync: jest.fn( ( ) => true ),
    wasSynced: jest.fn( ( ) => false )
  }
} );
