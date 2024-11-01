import {
  by,
  device,
  element,
  expect,
  waitFor
} from "detox";
import { MMKV } from "react-native-mmkv";

import { iNatE2eBeforeAll, iNatE2eBeforeEach } from "./helpers";

describe( "Signed out user", () => {
  beforeAll( async ( ) => iNatE2eBeforeAll( device ) );
  beforeAll( ( ) => {
    // Hide the onboarding modal
    const storage = new MMKV( );
    storage.set( "onBoardingShown", true );
  } );

  beforeEach( async ( ) => iNatE2eBeforeEach( device ) );

  it( "should start at My Observations with log in text", async () => {
    const loginText = element( by.id( "log-in-to-iNaturalist-button.text" ) );
    await waitFor( loginText ).toBeVisible( ).withTimeout( 10000 );
    await expect( loginText ).toBeVisible( );
  } );

  // it( "should add an observation without evidence", async () => {
  //   const addObsButton = element( by.id( "add-obs-button" ) );
  //   await waitFor( addObsButton ).toBeVisible( ).withTimeout( 10000 );
  //   await addObsButton.tap( );
  //   await expect( element( by.id( "identify-text" ) ) ).toBeVisible();
  //   const obsWithoutEvidenceButton = element( by.id( "observe-without-evidence-button" ) );
  //   await expect( obsWithoutEvidenceButton ).toBeVisible( );
  //   await obsWithoutEvidenceButton.tap( );
  //   await waitFor( element( by.id( "new-observation-text" ) ) )
  //    .toBeVisible( ).withTimeout( 10000 );
  // } );
} );
