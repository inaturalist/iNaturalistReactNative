import {
  by, element, waitFor
} from "detox";

const TIMEOUT = 10_000;

export default async function dismissAnnouncements() {
  try {
    // wait briefly to see if the announcement appears
    await waitFor( element( by.id( "announcements-container" ) ) )
      .toBeVisible()
      .withTimeout( TIMEOUT );

    // if we get here, the announcement is visible, so dismiss it
    await element( by.id( "announcements-dismiss" ) ).tap();
  } catch ( error ) {
    // if timeout occurs, the element isn't visible, so continue with test
    console.log( "No announcement present, continuing with test", error );
  }
}
