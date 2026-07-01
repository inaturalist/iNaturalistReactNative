import { define } from "factoria";

export default define( "LocalProjectObservation", faker => ( {
  uuid: faker.string.uuid( ),
  id: faker.number.int( ),
  projectId: faker.number.int( ),
  wasSynced: jest.fn( ( ) => false ),
  needsSync: jest.fn( ( ) => true ),
} ) );
