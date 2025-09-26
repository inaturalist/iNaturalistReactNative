import {
  by, element, expect, waitFor
} from "detox";

const TIMEOUT = 10_000;

// Start this on ObsEdit or ObsDetails via uploaded = false / true
export default async function deleteObservation( options = { uploaded: false } ) {
  if ( options.uploaded ) {
    const editButton = element( by.id( "ObsDetail.editButton" ) );
    await waitFor( editButton ).toBeVisible().withTimeout( TIMEOUT );
    // Navigate to the edit screen
    await editButton.tap();
  }
  // Check that the edit screen is visible
  await waitFor( element( by.text( "EVIDENCE" ) ) )
    .toBeVisible()
    .withTimeout( TIMEOUT );
  // Press header kebab menu
  const headerKebabMenu = element( by.id( "KebabMenu.Button" ) );
  await expect( headerKebabMenu ).toBeVisible();
  await headerKebabMenu.tap();
  // Press delete observation
  const deleteObservationMenuItem = element( by.id( "Header.delete-observation" ) );
  await waitFor( deleteObservationMenuItem ).toBeVisible().withTimeout( TIMEOUT );
  await deleteObservationMenuItem.tap();
  // Check that the delete button is visible
  const deleteObservationButton = element( by.text( "DELETE" ) );
  await waitFor( deleteObservationButton ).toBeVisible().withTimeout( TIMEOUT );
  // Press delete observation
  await deleteObservationButton.tap();
}
