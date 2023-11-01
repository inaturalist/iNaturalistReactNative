import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

describe( "Signed out user", () => {
  beforeAll( async ( ) => iNatE2eBeforeAll( device ) );
  beforeEach( async ( ) => iNatE2eBeforeEach( device ) );

  it( "should start at My Observations with log in text", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
    await waitFor( loginText ).toBeVisible( ).withTimeout( 10000 );
    await expect( loginText ).toBeVisible( );
  } );
} );
