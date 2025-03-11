// we don't need this or switchPowerMode.e2e.js.js since they're repetititve
// with what we're already doing in the signedIn and aiCamera tests
// and we would see any failures there

import { device } from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import closeOnboarding from "./sharedFlows/closeOnboarding";
import signIn from "./sharedFlows/signIn";

describe( "Shared flow", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it( "should sign in the test user", async () => {
    await closeOnboarding( );
    await signIn( );
  } );
} );
