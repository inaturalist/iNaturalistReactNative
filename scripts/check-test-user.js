require( "dotenv" ).config();
const inaturalistjs = require( "inaturalistjs" );

const testUser = process.env.E2E_TEST_USERNAME;

const checkTestUsersObservations = async ( ) => {
  // eslint-disable-next-line camelcase
  const apiResponse = await inaturalistjs.observations.search( {
    user_id: testUser
  } );
  console.log( "apiResponse :>> ", apiResponse );
  // eslint-disable-next-line camelcase
  if ( apiResponse.total_results !== 0 ) {
    // eslint-disable-next-line max-len
    console.log( "The e2e test user has observations associated with it, this will break the e2e tests." );
    console.log( "Please, manually remove those observations from the production database." );
    console.log( "If this happens repeatedly something might be fixed or automated." );
    process.exit( 1 );
  }
  console.log( "E2e test user has no observations" );
  process.exit( 0 );
};

checkTestUsersObservations( );
