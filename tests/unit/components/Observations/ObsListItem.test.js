import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";
import ObsListItem from "components/Observations/ObsListItem";
import React from "react";

import factory from "../../../factory";

const testObservation = factory( "LocalObservation", {
  taxon: { preferred_common_name: "Foo", name: "bar" },
  place_guess: "SF"
} );

test.only( "renders text passed into observation card", async () => {
  render(
    <ObsListItem observation={testObservation} onPress={() => jest.fn()} />
  );

  expect(
    screen.getByTestId( `ObsListItem.${testObservation.uuid}` )
  ).toBeTruthy();
  expect( screen.getByTestId( "ObsList.photo" ).props.source ).toStrictEqual( {
    uri: testObservation.observationPhotos[0].photo.url
  } );

  expect( screen.getByTestId( "display-taxon-name" ) ).toHaveTextContent(
    `${testObservation.taxon.preferred_common_name} ${testObservation.taxon.name}`
  );
  expect( screen.getByText( testObservation.placeGuess ) ).toBeTruthy();
  await waitFor( () => {
    expect(
      screen.getByText( testObservation.comments.length.toString() )
    ).toBeTruthy();
  } );
  await waitFor( () => {
    expect(
      screen.getByText( testObservation.identifications.length.toString() )
    ).toBeTruthy();
  } );
} );

test( "navigates to ObsDetails on button press", () => {
  const fakeNavigation = {
    navigate: jest.fn()
  };

  render(
    <ObsListItem
      item={testObservation}
      handlePress={() => fakeNavigation.navigate( "ObsDetails" )}
    />
  );

  const button = screen.getByTestId( `ObsListItem.${testObservation.uuid}` );

  fireEvent.press( button );
  expect( fakeNavigation.navigate ).toBeCalledWith( "ObsDetails" );
} );

test( "should not have accessibility errors", () => {
  const obsListItem = (
    <ObsListItem observation={testObservation} onPress={() => jest.fn()} />
  );

  expect( obsListItem ).toBeAccessible();
} );
