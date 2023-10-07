import { define } from "factoria";

export default define( "LocalObservation", faker => ( {
  uuid: faker.datatype.uuid( ),
  // This is a Realm object method that we use to see if a record was deleted or not
  isValid: jest.fn( ( ) => true ),
  wasSynced: jest.fn( ),
  needsSync: jest.fn( )
} ) );
