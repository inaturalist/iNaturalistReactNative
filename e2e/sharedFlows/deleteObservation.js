import {
  by, element, expect, waitFor
} from "detox";

export default async function deleteObservation( options = { uploaded: false } ) {
  if ( options.uploaded ) {
    const editButton = element( by.id( "ObsDetail.editButton" ) );
    await waitFor( editButton ).toBeVisible().withTimeout( 10000 );
    // Navigate to the edit screen
    await editButton.tap();
  }
  // Check that the edit screen is visible
  await waitFor( element( by.text( "EVIDENCE" ) ) )
    .toBeVisible()
    .withTimeout( 10000 );
  // Press header kebab menu
  const headerKebabMenu = element( by.id( "KebabMenu.Button" ) );
  await expect( headerKebabMenu ).toBeVisible();
  await headerKebabMenu.tap();
  // Press delete observation
  const deleteObservationMenuItem = element( by.id( "Header.delete-observation" ) );
  await waitFor( deleteObservationMenuItem ).toBeVisible().withTimeout( 10000 );
  await deleteObservationMenuItem.tap();
  // Check that the delete button is visible
  const deleteObservationButton = element( by.text( "DELETE" ) );
  await waitFor( deleteObservationButton ).toBeVisible().withTimeout( 10000 );
  // Press delete observation
  await deleteObservationButton.tap();
}
