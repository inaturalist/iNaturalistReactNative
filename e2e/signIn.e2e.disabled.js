import { device } from "detox";

import { iNatE2eAfterEach, iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import closeOnboarding from "./sharedFlows/closeOnboarding";
import signIn from "./sharedFlows/signIn";

describe( "Shared flow", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );
  afterEach( async ( ) => iNatE2eAfterEach( device ) );

  it( "should sign in the test user", async () => {
    await closeOnboarding( );
    await signIn( );
  } );
} );
