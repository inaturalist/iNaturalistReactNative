import { device } from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import signIn from "./sharedFlows/signIn";

describe( "Shared flow", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it( "should sign in the test user", async () => {
    await signIn( );
  } );
} );
