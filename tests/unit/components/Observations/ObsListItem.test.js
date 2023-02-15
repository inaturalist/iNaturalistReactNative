import {
  render,
  screen,
  waitFor
} from "@testing-library/react-native";
import ObsListItem from "components/Observations/ObsListItem";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../factory";

const testObservation = factory( "LocalObservation", {
  taxon: { preferred_common_name: "Foo", name: "bar" },
  place_guess: "SF"
} );

describe( "ObsListItem", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  it( "renders text passed into observation card", async () => {
    render( <ObsListItem observation={testObservation} /> );

    expect(
      screen.getByTestId( `ObsList.obsListItem.${testObservation.uuid}` )
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

  it( "should not have accessibility errors", () => {
    const obsListItem = <ObsListItem observation={testObservation} />;

    expect( obsListItem ).toBeAccessible();
  } );
} );
