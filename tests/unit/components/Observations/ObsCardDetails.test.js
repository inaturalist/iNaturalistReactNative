import { render } from "@testing-library/react-native";
import ObsCardDetails from "components/Observations/ObsCardDetails";
import React from "react";

import factory from "../../../factory";

const testObservation = factory( "LocalObservation", {
  taxon: { preferred_common_name: "Foo", name: "bar" }
} );

test( "renders correct taxon and observation details", () => {
  const { getByText } = render(
    <ObsCardDetails view="list" item={testObservation} />
  );

  expect(
    getByText(
      `${testObservation.taxon.preferred_common_name} (${testObservation.taxon.name})`
    )
  ).toBeTruthy();
  expect( getByText( testObservation.placeGuess ) ).toBeTruthy();
} );
