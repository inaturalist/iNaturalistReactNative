import { device } from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";
import switchPowerMode from "./sharedFlows/switchPowerMode";

describe( "Shared flow", () => {
  beforeAll( async () => iNatE2eBeforeAll( device ) );
  beforeEach( async () => iNatE2eBeforeEach( device ) );

  it( "should switch to power mode", async () => {
    await switchPowerMode( );
  } );
} );
